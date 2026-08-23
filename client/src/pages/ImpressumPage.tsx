import { Link } from 'react-router-dom'

export function ImpressumPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 rounded-xl border border-white/10 bg-[var(--card)] p-5 md:p-8">
      <header>
        <p className="text-sm font-semibold text-yellow-300">Rechtliche Angaben</p>
        <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Impressum</h1>
      </header>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">Angaben gemäß § 5 TMG</h2>
        <div className="rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
          <p>Aleksandr Nikolaev</p>
          <p>Lea-Grundig-Str. 20</p>
          <p>12679 Berlin</p>
          <p className="mt-2">
            E-Mail:{' '}
            <a className="text-yellow-300 hover:text-yellow-200" href="mailto:immoscout@berlin.de">
              immoscout@berlin.de
            </a>
          </p>
          <p>
            Telefon:{' '}
            <a className="text-yellow-300 hover:text-yellow-200" href="tel:+4915204530520">
              +49 152 045 30520
            </a>
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-bold text-white">Haftungsausschluss</h2>
        <div className="space-y-3 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
          <p>
            Die Inhalte dieser Website wurden mit größtmöglicher Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und
            Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.
          </p>
          <p>
            Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen
            Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte
            oder gespeicherte fremde Informationen zu überwachen.
          </p>
          <p>
            Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben
            hiervon unberührt.
          </p>
        </div>
      </section>

      <section className="rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
        <p className="font-semibold text-white">Datenschutz</p>
        <p className="mt-2">
          Zur Datenschutzerklärung:{' '}
          <Link className="font-semibold text-yellow-300 hover:text-yellow-200" to="/datenschutz">
            /datenschutz
          </Link>
        </p>
      </section>
    </section>
  )
}
