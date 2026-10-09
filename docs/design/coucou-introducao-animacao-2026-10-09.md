# Introdução de lançamento do Coucou

**Análise estática do código consultado em 2026-10-09.** A referência principal é o renderer Canvas 2D atual de `windows/src/mochi/greeting.ts`; o changelog 0.1.5 resume a intenção visual como Mochi caindo na ilha, quicando, deslizando para o lado, acenando e voltando ao lugar.

## Leitura rápida

A introdução não usa partículas como confete decorativo. Ela coreografa uma chegada: a ilha abre, Mochi cai, marca o pouso com squash e quique, desliza para abrir espaço ao aceno e retorna ao centro. Os efeitos reforçam duas partes específicas desse movimento: riscos verticais dão velocidade à queda; um anel de pontos acompanha o pouso e se espalha pela largura da ilha. O gesto, o olhar e a mudança de cor fazem a maior parte do trabalho de personalidade.

O código calcula a pose e os efeitos pelo mesmo tempo decorrido em um Canvas. Não há simulação física de partículas: as posições e curvas são determinísticas, o que mantém o desenho previsível e alinhado à animação do corpo.

## Sequência

| Tempo aproximado | Ação | Leitura visual |
|---|---|---|
| 0–0,55 s | A superfície cresce da ilha compacta para o painel de 640 × 150. Mochi começa a aparecer por volta de 0,2 s e desce até o centro. | A chegada parece vir de dentro da borda, em vez de ser apenas um fade do personagem. |
| 0–0,55 s | Cerca de 70 riscos verticais brancos cruzam o painel. | Direção e velocidade da queda. |
| 0,45–1,8 s | Um anel de 90 pontos brancos se expande em oval a partir do centro. | O pouso ganha um pulso largo, quase horizontal, que combina com o formato da ilha. |
| 0,52–0,9 s | O corpo comprime no contato, rebate para cima e volta à posição de repouso; os olhos fazem uma expressão feliz. | O impacto fica legível sem precisar de texto ou de um efeito grande. |
| 0,85–2,4 s | Mochi desloca-se gradualmente cerca de 49 px para um lado. Entre 1,2 e 1,6 s há outro dip e pop. | O movimento prepara espaço e ritmo para o gesto seguinte. |
| 1,3–2,7 s | As mãos aparecem; o aceno começa em 1,45 s e a mão oscila rapidamente. | O personagem passa de objeto que pousa a anfitrião que cumprimenta. |
| 2,4–3,45 s | Mochi recolhe as mãos, afunda um pouco e volta ao centro; o badge aparece em 2,72 s. | O gesto termina, o estado fica marcado e a silhueta reassume seu lugar. |
| 3,85–4,15 s | O halo e a tinta do corpo transitam de dourado para azul. | A chegada se resolve num estado calmo de espera. |
| 4,6 s | O controlador conclui a saudação; sem interação, a máquina de estados espera mais 0,6 s antes de recolher para o modo compacto. | A animação termina como parte da interface, sem deixar uma cena isolada. |

Os intervalos se sobrepõem de propósito. Por exemplo, o anel começa 150 ms antes do ponto de pouso aproximado; isso faz o pulso e o squash parecerem um único evento. O movimento lateral também acontece em paralelo ao segundo dip e ao aceno, em vez de formar uma sequência de poses paradas.

## Como as partículas funcionam

- O gerador usa uma semente fixa (`7`), então os mesmos riscos e pontos ocupam as mesmas posições a cada execução.
- Os riscos são linhas brancas estreitas, com variação pequena de velocidade, comprimento, opacidade e atraso. Eles descem por no máximo 550 ms.
- O anel usa 90 quadradinhos brancos de aproximadamente 0,7–1,6 px. O raio horizontal cresce de 14 para 380 px em 1,35 s; o vertical mede 34% do horizontal. O formato produz uma onda achatada que acompanha a ilha, não uma explosão esférica.
- O desenho é recortado pelos cantos arredondados do painel escuro. As partículas permanecem dentro da composição e não viram uma camada de confete solta sobre a tela.
- Não há partículas multicoloridas na versão atual de `main`: são riscos e pontos brancos. As cores aparecem no halo, no corpo e no badge, que são sinais diferentes.
- O som da saudação começa com o controlador. Se o usuário interrompe a animação ao sair da área, a pose recolhe em 340 ms e o som perde volume junto.

## Por que a animação funciona

1. **A chegada tem causa e consequência.** Riscos descendo, corpo comprimindo e anel abrindo apontam para o mesmo instante.
2. **As partículas são subordinadas ao personagem.** São pequenas, claras e breves; depois do primeiro impacto, Mochi e o aceno ficam em primeiro plano.
3. **A personalidade vem de gestos legíveis.** Olhar, dip, mãos e retorno ao centro comunicam curiosidade e cumprimento melhor do que aumentar a quantidade de partículas.
4. **A animação tem resolução.** O badge entra depois do aceno, o halo muda de cor e o personagem retorna ao lugar compacto.
5. **Há caminho de interrupção.** A saudação pode ser encurtada pelo movimento do usuário; o personagem e o som são conduzidos para fora sem exigir que a pessoa espere o fim.

O ponto mais aproveitável para o Edge Ghosty é essa relação temporal entre efeito e ação: uma camada curta de velocidade na entrada e um pulso discreto no pouso. Copiar o grande painel horizontal, o formato do corpo, o badge ou a paleta do Mochi não é necessário. O Ghosty já tem identidade própria e o onboarding também precisa explicar o produto.

## Comparação com o onboarding atual do Ghosty

O onboarding atual combina o Canvas do Ghosty e a chamada `welcome()` com um halo, órbitas e seis símbolos flutuantes em CSS (`✦`, `✧` e pontos). Esses símbolos repetem uma deriva de 3,2 s enquanto o onboarding está visível. No Coucou, os riscos e o anel pertencem à linha do tempo única da saudação e acabam junto com a chegada.

Isso cria duas propostas diferentes: o Ghosty atual apresenta personagem e produto dentro de uma tela de configuração; o Coucou faz uma saudação curta de lançamento da ilha. Se a intenção for aproximar a sensação do Coucou, o ajuste de maior impacto seria sincronizar um efeito de entrada e um único pulso com a pose do Ghosty, mantendo os textos e as instruções do onboarding. Reduzir ou manter as órbitas decorativas é uma escolha de direção visual, não um requisito da sequência.

## Escopo e ressalvas

- A análise consultou o código atual em `main` e as notas oficiais, mas não executou o Coucou nem capturou a animação em runtime. As leituras sobre impacto e ritmo são inferências a partir dos tempos, coordenadas e desenhos.
- O clone local de Coucou disponível em `C:\Users\gustavo.sanches\Documents\coucou` está no commit `0aae11b` e tem uma versão anterior dessa sequência: cinco anéis e riscos coloridos. Este documento segue o código atual do GitHub, que usa um anel branco e riscos brancos. As duas versões não devem ser confundidas.

## Fontes

- [Renderer Canvas 2D atual: poses e tempos](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/greeting.ts#L79-L187)
- [Geração determinística dos riscos e pontos](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/greeting.ts#L302-L329)
- [Desenho, expansão e recorte das partículas](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/greeting.ts#L495-L527)
- [Controle da saudação, som, interrupção e conclusão](https://github.com/Louis-CFM/coucou/blob/main/windows/src/mochi/greeting.ts#L545-L629)
- [Abertura da ilha para a saudação](https://github.com/Louis-CFM/coucou/blob/main/windows/src/island/island.ts#L290-L323)
- [Atraso de recolhimento após a saudação](https://github.com/Louis-CFM/coucou/blob/main/windows/src/island/fsm.ts#L24-L27)
- [Notas oficiais da versão 0.1.5](https://github.com/Louis-CFM/coucou/releases/tag/v0.1.5)
