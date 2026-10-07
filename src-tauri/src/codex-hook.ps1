param(
  [Parameter(Mandatory = $true)]
  [string]$QueueDirectory
)

$ErrorActionPreference = "SilentlyContinue"
$temporaryPath = $null
$eventPath = $null
$responsePath = $null
$eventName = ""

function Remove-FileQuietly([string]$Path) {
  if ($Path -and (Test-Path -LiteralPath $Path)) {
    Remove-Item -LiteralPath $Path -Force
  }
}

function Write-AtomicJson([string]$Path, $Value) {
  $temp = "$Path.$([Guid]::NewGuid().ToString('N')).tmp"
  $json = ConvertTo-Json -InputObject $Value -Depth 8 -Compress
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($temp, $json, $utf8)
  [System.IO.File]::Move($temp, $Path)
}

function Test-GhostyHeartbeat([string]$Path) {
  $heartbeat = Get-Item -LiteralPath $Path -ErrorAction SilentlyContinue
  if (-not $heartbeat) { return $false }
  return ([DateTime]::UtcNow - $heartbeat.LastWriteTimeUtc).TotalSeconds -le 4
}

function Get-ApprovalDescription($Payload, [string]$ToolName) {
  $toolInput = $Payload.tool_input
  $description = [string]$toolInput.description
  if ([string]::IsNullOrWhiteSpace($description)) {
    if ($ToolName -eq "Bash" -and -not [string]::IsNullOrWhiteSpace([string]$toolInput.command)) {
      $command = [regex]::Replace([string]$toolInput.command, '\s+', ' ').Trim()
      $description = "Executar no terminal: $command"
    } elseif ($ToolName -eq "apply_patch") {
      $description = "Aplicar uma alteração de arquivos pelo Codex."
    } else {
      $description = "Permitir o uso da ferramenta $ToolName."
    }
  }
  $description = [regex]::Replace($description, '[\x00-\x08\x0B\x0C\x0E-\x1F]', '').Trim()
  if ($description.Length -gt 220) { $description = $description.Substring(0, 217) + "..." }
  return $description
}

function Wait-ForApproval([string]$DecisionPath, [string]$DisabledPath, [string]$HeartbeatPath) {
  $deadline = [DateTime]::UtcNow.AddSeconds(570)
  while ([DateTime]::UtcNow -lt $deadline) {
    if ((Test-Path -LiteralPath $DisabledPath) -or -not (Test-GhostyHeartbeat $HeartbeatPath)) {
      return $null
    }
    if (Test-Path -LiteralPath $DecisionPath) {
      try {
        $reply = [System.IO.File]::ReadAllText($DecisionPath) | ConvertFrom-Json
        if ($reply.decision -eq "allow" -or $reply.decision -eq "deny") {
          return [string]$reply.decision
        }
      } finally {
        Remove-FileQuietly $DecisionPath
      }
    }
    Start-Sleep -Milliseconds 100
  }
  return $null
}

function Write-PermissionDecision([string]$Decision) {
  $result = if ($Decision -eq "allow") {
    @{ behavior = "allow" }
  } else {
    @{ behavior = "deny"; message = "Recusado no Ghosty." }
  }
  $output = @{
    hookSpecificOutput = @{
      hookEventName = "PermissionRequest"
      decision = $result
    }
  }
  $json = ConvertTo-Json -InputObject $output -Depth 8 -Compress
  [Console]::Out.WriteLine($json)
}

try {
  $baseDirectory = Split-Path -Parent $QueueDirectory
  $disabledFlag = Join-Path $baseDirectory "disabled.flag"
  $heartbeatPath = Join-Path $baseDirectory "ui-heartbeat"
  $responseDirectory = Join-Path $baseDirectory "responses"
  if (Test-Path -LiteralPath $disabledFlag) { exit 0 }

  $raw = [Console]::In.ReadToEnd()
  if ([string]::IsNullOrWhiteSpace($raw)) { exit 0 }

  $payload = $raw | ConvertFrom-Json
  $eventName = [string]$payload.hook_event_name
  $supportedEvents = @(
    "SessionStart", "UserPromptSubmit", "PreToolUse", "PermissionRequest",
    "PostToolUse", "SubagentStart", "SubagentStop", "Stop", "Interrupt", "SessionEnd"
  )
  if ($eventName -notin $supportedEvents) { exit 0 }

  [void][System.IO.Directory]::CreateDirectory($QueueDirectory)
  $staleBefore = [DateTime]::UtcNow.AddSeconds(-30)
  Get-ChildItem -LiteralPath $QueueDirectory -Filter "*.json" -File |
    Where-Object { $_.LastWriteTimeUtc -lt $staleBefore } |
    Remove-Item -Force
  if (Test-Path -LiteralPath $responseDirectory) {
    Get-ChildItem -LiteralPath $responseDirectory -Filter "*.json" -File |
      Where-Object { $_.LastWriteTimeUtc -lt $staleBefore } |
      Remove-Item -Force
  }

  $occurredAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $toolName = $null
  $agentType = $null
  $sessionId = $null
  $approvalId = $null
  $approvalDescription = $null
  $approvalExpiresAt = $null
  if ($payload.tool_name) {
    $rawToolName = [string]$payload.tool_name
    $toolName = $rawToolName.Substring(0, [Math]::Min(64, $rawToolName.Length))
  }
  if ($payload.agent_type) {
    $rawAgentType = [string]$payload.agent_type
    $agentType = $rawAgentType.Substring(0, [Math]::Min(48, $rawAgentType.Length))
  }
  if ($payload.session_id) {
    $rawSessionId = [string]$payload.session_id
    $sessionId = $rawSessionId.Substring(0, [Math]::Min(80, $rawSessionId.Length))
  }

  if ($eventName -eq "PermissionRequest") {
    if (-not (Test-GhostyHeartbeat $heartbeatPath)) { exit 0 }
    [void][System.IO.Directory]::CreateDirectory($responseDirectory)
    $approvalId = [Guid]::NewGuid().ToString("N")
    $approvalDescription = Get-ApprovalDescription $payload ([string]$toolName)
    $approvalExpiresAt = $occurredAt + 570000
  }

  $event = [ordered]@{
    eventName = $eventName
    occurredAt = $occurredAt
    toolName = $toolName
    agentType = $agentType
    sessionId = $sessionId
    approvalId = $approvalId
    approvalDescription = $approvalDescription
    approvalExpiresAt = $approvalExpiresAt
  }
  $name = "{0:D13}-{1}" -f $occurredAt, [Guid]::NewGuid().ToString("N")
  $temporaryPath = Join-Path $QueueDirectory ($name + ".tmp")
  $eventPath = Join-Path $QueueDirectory ($name + ".json")
  Write-AtomicJson $temporaryPath $event
  [System.IO.File]::Move($temporaryPath, $eventPath)
  $temporaryPath = $null

  if ($eventName -eq "PermissionRequest") {
    $responsePath = Join-Path $responseDirectory ($approvalId + ".json")
    $decision = Wait-ForApproval $responsePath $disabledFlag $heartbeatPath
    Remove-FileQuietly $eventPath
    if ($decision) { Write-PermissionDecision $decision }
  }
} catch {
  Remove-FileQuietly $temporaryPath
  if ($eventName -eq "PermissionRequest") { Remove-FileQuietly $eventPath }
  # The observer must never change the Codex operation when its local bridge fails.
}

exit 0
