param(
  [Parameter(Mandatory = $true)]
  [string]$QueueDirectory
)

$ErrorActionPreference = "SilentlyContinue"
$temporaryPath = $null

try {
  $disabledFlag = Join-Path (Split-Path -Parent $QueueDirectory) "disabled.flag"
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

  $occurredAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
  $toolName = $null
  $agentType = $null
  if ($payload.tool_name) {
    $rawToolName = [string]$payload.tool_name
    $toolName = $rawToolName.Substring(0, [Math]::Min(64, $rawToolName.Length))
  }
  if ($payload.agent_type) {
    $rawAgentType = [string]$payload.agent_type
    $agentType = $rawAgentType.Substring(0, [Math]::Min(48, $rawAgentType.Length))
  }
  $event = [ordered]@{
    eventName = $eventName
    occurredAt = $occurredAt
    toolName = $toolName
    agentType = $agentType
  }
  $json = ConvertTo-Json -InputObject $event -Compress
  $name = "{0:D13}-{1}" -f $occurredAt, [Guid]::NewGuid().ToString("N")
  $temporaryPath = Join-Path $QueueDirectory ($name + ".tmp")
  $eventPath = Join-Path $QueueDirectory ($name + ".json")
  $utf8 = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($temporaryPath, $json, $utf8)
  [System.IO.File]::Move($temporaryPath, $eventPath)
} catch {
  if ($temporaryPath -and (Test-Path -LiteralPath $temporaryPath)) {
    Remove-Item -LiteralPath $temporaryPath -Force
  }
  # Mochi's observer must never block or change the Codex operation.
}

exit 0
