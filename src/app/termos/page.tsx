import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de Uso — Ajuda Minha Cidade",
  description: "Termos de Uso da plataforma Ajuda Minha Cidade.",
};

const LAST_UPDATED = "26 de fevereiro de 2025";

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Voltar ao mapa
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
        <p className="text-sm text-muted-foreground mb-10">
          Última atualização: {LAST_UPDATED}
        </p>

        <div className="prose prose-sm max-w-none space-y-8 text-foreground">

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-900">
            <strong>Atenção:</strong> ao acessar ou utilizar o Ajuda Minha
            Cidade, você declara ter lido, compreendido e concordado
            integralmente com estes Termos de Uso. Se não concordar com
            qualquer disposição, não utilize a plataforma.
          </div>

          <Section title="1. Identificação da Plataforma e dos Operadores">
            <p>
              <strong>Ajuda Minha Cidade</strong> é uma plataforma digital
              colaborativa, de caráter voluntário e <strong>sem fins
              lucrativos</strong>, desenvolvida e operada por:
            </p>
            <ul>
              <li>
                <strong>Jorge Roberto Tomaz Junior</strong> —{" "}
                <a
                  href="mailto:jorgerobertodev@gmail.com"
                  className="underline"
                >
                  jorgerobertodev@gmail.com
                </a>
              </li>
              <li>
                <strong>Thayrone de Souza Nascimento</strong> —{" "}
                <a
                  href="mailto:thaydeveloper26@gmail.com"
                  className="underline"
                >
                  thaydeveloper26@gmail.com
                </a>
              </li>
            </ul>
            <p>
              Os Operadores não possuem fins lucrativos, não recebem
              remuneração pelo serviço e não se constituem como empresa,
              associação, fundação ou qualquer outra pessoa jurídica em razão
              desta plataforma.
            </p>
          </Section>

          <Section title="2. Objeto e Natureza do Serviço">
            <p>
              O Ajuda Minha Cidade disponibiliza um mapa colaborativo em tempo
              real que permite que cidadãos:
            </p>
            <ul>
              <li>
                Registrem pontos de apoio humanitário (abrigos, pontos de
                coleta, distribuição de doações);
              </li>
              <li>
                Sinalizem ocorrências de emergência (deslizamentos,
                soterramentos);
              </li>
              <li>
                Confirmem ou denunciem informações cadastradas por outros
                usuários;
              </li>
              <li>
                Visualizem alertas meteorológicos e informações de apoio.
              </li>
            </ul>
            <p>
              O serviço é fornecido <strong>gratuitamente</strong>,{" "}
              <strong>&quot;no estado em que se encontra&quot;</strong> (
              <em>as is</em>), sem qualquer garantia de continuidade,
              disponibilidade, precisão ou adequação a finalidade específica.
            </p>
          </Section>

          <Section title="3. Isenção de Responsabilidade — Informações de Emergência">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-900">
              <strong>Cláusula essencial — leia com atenção:</strong>
            </div>
            <p>
              <strong>
                As informações publicadas no Ajuda Minha Cidade são
                inteiramente geradas por usuários voluntários e não são
                verificadas, validadas ou homologadas pelos Operadores.
              </strong>
            </p>
            <p>
              Os Operadores <strong>não se responsabilizam</strong>, em nenhuma
              hipótese, por:
            </p>
            <ul>
              <li>
                Precisão, veracidade, atualização ou completude das informações
                publicadas por usuários;
              </li>
              <li>
                Danos físicos, morais, materiais ou de qualquer natureza
                decorrentes do uso ou da impossibilidade de uso das informações
                disponibilizadas na plataforma;
              </li>
              <li>
                Decisões tomadas com base nos dados exibidos no mapa,
                incluindo, mas não se limitando a: deslocamentos, busca por
                abrigo, doações ou ações de resgate;
              </li>
              <li>
                Indisponibilidade, lentidão ou falhas da plataforma em momentos
                críticos;
              </li>
              <li>
                Informações desatualizadas, pontos inexistentes ou encerrados
                que ainda estejam visíveis no mapa.
              </li>
            </ul>
            <p>
              <strong>
                Em situações de emergência, sempre consulte também as
                autoridades competentes: Defesa Civil (telefone 199), SAMU
                (192), Corpo de Bombeiros (193) e Polícia Militar (190).
              </strong>
            </p>
          </Section>

          <Section title="4. Cadastro e Conta de Usuário">
            <p>
              O acesso a funcionalidades de criação de pontos requer
              autenticação por meio de conta Google. Ao realizar o login, o
              usuário:
            </p>
            <ul>
              <li>
                Declara ter capacidade civil plena (ser maior de 18 anos ou
                estar devidamente assistido ou representado);
              </li>
              <li>
                Autoriza o uso dos dados fornecidos pelo Google (nome, e-mail
                e foto de perfil) conforme a{" "}
                <Link href="/privacidade" className="underline">
                  Política de Privacidade
                </Link>
                ;
              </li>
              <li>
                É o único responsável por todas as ações realizadas com sua
                conta;
              </li>
              <li>
                Deve comunicar imediatamente os Operadores caso suspeite de
                acesso não autorizado à sua conta.
              </li>
            </ul>
          </Section>

          <Section title="5. Responsabilidades do Usuário ao Publicar Conteúdo">
            <p>
              Ao cadastrar pontos, necessidades, descrições ou qualquer
              informação na plataforma, o usuário declara e garante que:
            </p>
            <ul>
              <li>
                As informações são verdadeiras, precisas, atualizadas e não
                induzem terceiros a erro;
              </li>
              <li>
                Não viola direitos de terceiros, incluindo direitos de
                privacidade, honra, imagem ou propriedade intelectual;
              </li>
              <li>
                O conteúdo não é ilegal, ofensivo, discriminatório, de ódio,
                pornográfico, fraudulento ou prejudicial a terceiros;
              </li>
              <li>
                Responsabiliza-se civil e penalmente perante terceiros e perante
                os Operadores por todo conteúdo publicado sob sua conta.
              </li>
            </ul>
            <p>
              O usuário concorda em <strong>indenizar e isentar</strong> os
              Operadores de quaisquer reclamações, demandas, perdas, danos,
              custos e despesas (incluindo honorários advocatícios) decorrentes
              de conteúdo publicado por ele ou do uso indevido da plataforma.
            </p>
          </Section>

          <Section title="6. Condutas Proibidas">
            <p>É expressamente vedado ao usuário:</p>
            <ul>
              <li>
                Publicar informações falsas, enganosas ou deliberadamente
                incorretas, especialmente em contexto de emergência;
              </li>
              <li>
                Utilizar a plataforma para fins comerciais, publicitários ou de
                captação de recursos sem autorização prévia;
              </li>
              <li>
                Realizar ataques, tentativas de invasão, injeção de código ou
                qualquer ação que comprometa a segurança ou integridade da
                plataforma;
              </li>
              <li>
                Usar robôs, scrapers ou mecanismos automatizados para acessar a
                plataforma em volume excessivo;
              </li>
              <li>
                Fazer denúncias abusivas ou de má-fé contra pontos legítimos;
              </li>
              <li>
                Criar contas falsas ou múltiplas contas para burlar limites ou
                moderação;
              </li>
              <li>
                Praticar qualquer ato que viole a legislação brasileira vigente,
                em especial o Marco Civil da Internet (Lei nº 12.965/2014) e a
                LGPD (Lei nº 13.709/2018).
              </li>
            </ul>
            <p>
              O descumprimento das condutas acima pode resultar na suspensão ou
              exclusão imediata da conta, sem aviso prévio, e na responsabilização
              civil e criminal do infrator.
            </p>
          </Section>

          <Section title="7. Moderação e Remoção de Conteúdo">
            <p>
              Os Operadores reservam-se o direito de remover, a qualquer tempo
              e sem aviso prévio, qualquer ponto ou conteúdo que:
            </p>
            <ul>
              <li>
                Viole estes Termos de Uso ou a legislação vigente;
              </li>
              <li>
                Seja reportado pela comunidade como incorreto, enganoso ou
                abusivo;
              </li>
              <li>
                Seja considerado prejudicial aos usuários ou à plataforma,
                a critério exclusivo dos Operadores.
              </li>
            </ul>
            <p>
              A remoção de conteúdo <strong>não gera direito a indenização</strong>{" "}
              ou compensação de qualquer natureza ao usuário.
            </p>
          </Section>

          <Section title="8. Limitação de Responsabilidade">
            <p>
              Na máxima extensão permitida pela legislação aplicável, os
              Operadores não serão responsáveis por quaisquer danos diretos,
              indiretos, incidentais, especiais, consequenciais ou punitivos,
              incluindo, mas não se limitando a:
            </p>
            <ul>
              <li>Perda de dados ou informações;</li>
              <li>
                Danos pessoais ou patrimoniais decorrentes do uso ou da
                incapacidade de uso da plataforma;
              </li>
              <li>
                Conduta de terceiros usuários na plataforma;
              </li>
              <li>
                Interrupções, falhas técnicas ou indisponibilidade do serviço.
              </li>
            </ul>
            <p>
              Considerando que o serviço é gratuito e voluntário, a
              responsabilidade total dos Operadores perante o usuário, em
              qualquer hipótese, <strong>não excederá o valor de R$ 0,00
              (zero reais)</strong>, salvo nos casos de dolo ou culpa grave
              expressamente previstos em lei.
            </p>
          </Section>

          <Section title="9. Disponibilidade do Serviço">
            <p>
              O Ajuda Minha Cidade é fornecido sem garantia de disponibilidade
              contínua. Os Operadores podem, a qualquer tempo e sem aviso
              prévio:
            </p>
            <ul>
              <li>Suspender ou encerrar o serviço total ou parcialmente;</li>
              <li>
                Realizar manutenções que resultem em indisponibilidade
                temporária;
              </li>
              <li>
                Modificar, adicionar ou remover funcionalidades.
              </li>
            </ul>
            <p>
              O encerramento do serviço <strong>não gera qualquer direito
              de indenização</strong> aos usuários, dado seu caráter gratuito
              e voluntário.
            </p>
          </Section>

          <Section title="10. Propriedade Intelectual">
            <p>
              O código-fonte, design, marca, nome e demais elementos da
              plataforma são de propriedade dos Operadores ou licenciados de
              terceiros. É vedada a reprodução, distribuição ou uso comercial
              sem autorização prévia e por escrito.
            </p>
            <p>
              O usuário mantém a titularidade do conteúdo que publica, mas
              concede aos Operadores uma <strong>licença não exclusiva,
              gratuita, irrevogável e mundial</strong> para armazenar, exibir,
              reproduzir e distribuir esse conteúdo dentro da plataforma,
              enquanto este estiver publicado.
            </p>
          </Section>

          <Section title="11. Links e Serviços de Terceiros">
            <p>
              A plataforma integra serviços de terceiros (Google, Supabase,
              Mapbox, Open-Meteo, INMET). Os Operadores não se responsabilizam
              pela disponibilidade, precisão ou políticas desses serviços.
              O uso desses serviços está sujeito aos termos e políticas dos
              respectivos fornecedores.
            </p>
          </Section>

          <Section title="12. Alterações dos Termos">
            <p>
              Estes Termos podem ser revisados e atualizados a qualquer
              momento. A versão vigente sempre estará disponível em{" "}
              <strong>/termos</strong>. O uso continuado da plataforma após
              publicação de alterações constitui aceitação dos novos termos.
              Caso não concorde com as alterações, o usuário deve cessar o uso
              imediatamente.
            </p>
          </Section>

          <Section title="13. Lei Aplicável e Foro">
            <p>
              Estes Termos são regidos exclusivamente pelas leis da República
              Federativa do Brasil, em especial:
            </p>
            <ul>
              <li>Lei nº 10.406/2002 — Código Civil Brasileiro;</li>
              <li>
                Lei nº 12.965/2014 — Marco Civil da Internet;
              </li>
              <li>Lei nº 13.709/2018 — Lei Geral de Proteção de Dados (LGPD);</li>
              <li>
                Lei nº 8.078/1990 — Código de Defesa do Consumidor (quando
                aplicável).
              </li>
            </ul>
            <p>
              Fica eleito o foro do domicílio dos Operadores para dirimir
              quaisquer controvérsias oriundas destes Termos, com renúncia
              expressa a qualquer outro, por mais privilegiado que seja.
            </p>
          </Section>

          <Section title="14. Disposições Gerais">
            <p>
              Se qualquer disposição destes Termos for considerada inválida ou
              inexequível, as demais disposições permanecerão em pleno vigor e
              efeito. A tolerância de qualquer descumprimento não implica
              renúncia ao direito de exigir o cumprimento no futuro.
            </p>
            <p>
              Estes Termos constituem o acordo integral entre o usuário e os
              Operadores em relação ao uso da plataforma, substituindo
              quaisquer acordos anteriores sobre o mesmo objeto.
            </p>
          </Section>

          <Section title="15. Contato">
            <p>
              Para dúvidas, sugestões ou comunicações relacionadas a estes
              Termos:
            </p>
            <ul>
              <li>
                <strong>Jorge Roberto Tomaz Junior</strong>:{" "}
                <a
                  href="mailto:jorgerobertodev@gmail.com"
                  className="underline"
                >
                  jorgerobertodev@gmail.com
                </a>
              </li>
              <li>
                <strong>Thayrone de Souza Nascimento</strong>:{" "}
                <a
                  href="mailto:thaydeveloper26@gmail.com"
                  className="underline"
                >
                  thaydeveloper26@gmail.com
                </a>
              </li>
            </ul>
          </Section>
        </div>

        <div className="mt-12 pt-6 border-t flex gap-4 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors">
            Voltar ao mapa
          </Link>
          <Link
            href="/privacidade"
            className="hover:text-foreground transition-colors"
          >
            Política de Privacidade
          </Link>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="space-y-3 text-sm leading-relaxed text-foreground/90">
        {children}
      </div>
    </section>
  );
}
