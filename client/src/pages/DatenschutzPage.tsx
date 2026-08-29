export function DatenschutzPage() {
  return (
    <section className="mx-auto max-w-4xl space-y-6 rounded-xl border border-white/10 bg-[var(--card)] p-5 md:p-8">
      <header>
        <p className="text-sm font-semibold text-yellow-300">DSGVO</p>
        <h1 className="mt-2 text-3xl font-black text-white md:text-4xl">Datenschutzerklärung</h1>
      </header>

      <section className="space-y-3 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
        <h2 className="text-xl font-bold text-white">1. Welche Daten wir sammeln</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Kontaktdaten bei Registrierung und Login (insbesondere E-Mail-Adresse, optional Name).</li>
          <li>Inseratsdaten bei der Erstellung von Listings (Titel, Bezirk, Adresse, Preis, Beschreibung, Bilder).</li>
          <li>Nachrichteninhalte, wenn Interessenten über das Kontaktformular eine Anfrage senden.</li>
          <li>Technische Zugriffsdaten im Rahmen des sicheren Betriebs der Plattform (z. B. Server-Logs).</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
        <h2 className="text-xl font-bold text-white">2. Wie wir die Daten verwenden</h2>
        <ul className="list-disc space-y-2 pl-5">
          <li>Zur Bereitstellung der Plattformfunktionen (Login, Anzeigen veröffentlichen, Kontaktaufnahme).</li>
          <li>Zur Kommunikation zwischen Vermietenden und Interessenten.</li>
          <li>Zur Verhinderung von Missbrauch sowie zur Sicherstellung der technischen Stabilität.</li>
          <li>Zur Erfüllung gesetzlicher Pflichten nach geltendem Datenschutz- und Telemedienrecht.</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
        <h2 className="text-xl font-bold text-white">3. Resend als E-Mail-Dienstleister</h2>
        <p>
          Für den Versand von Magic-Links und Kontakt-E-Mails nutzen wir Resend als Auftragsverarbeiter. Die Verarbeitung
          erfolgt auf Grundlage eines Vertrags zur Auftragsverarbeitung gemäß Art. 28 DSGVO.
        </p>
        <p>
          Dabei werden für den E-Mail-Versand notwendige Daten (Empfängeradresse, Betreff, Nachrichteninhalt) an Resend
          übermittelt.
        </p>
      </section>

      <section className="space-y-3 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
        <h2 className="text-xl font-bold text-white">4. Ihre Rechte</h2>
        <p>Sie haben im Rahmen der DSGVO insbesondere folgende Rechte:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>Recht auf Auskunft über die bei uns gespeicherten personenbezogenen Daten (Art. 15 DSGVO)</li>
          <li>Recht auf Berichtigung unrichtiger Daten (Art. 16 DSGVO)</li>
          <li>Recht auf Löschung Ihrer Daten (Art. 17 DSGVO)</li>
          <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
          <li>Recht auf Widerspruch gegen bestimmte Verarbeitungen (Art. 21 DSGVO)</li>
        </ul>
      </section>

      <section className="space-y-3 rounded-lg border border-white/10 bg-slate-900/40 p-4 text-slate-200">
        <h2 className="text-xl font-bold text-white">5. Kontakt des Verantwortlichen</h2>
        <p>Aleksandr Nikolaev</p>
        <p>Lea-Grundig-Str. 20, 12679 Berlin</p>
        <p>
          E-Mail:{' '}
          <a className="text-yellow-300 hover:text-yellow-200" href="mailto:subletberlino@gmail.com">
            subletberlino@gmail.com
          </a>
        </p>
        <p>
          Telefon:{' '}
          <a className="text-yellow-300 hover:text-yellow-200" href="tel:+4915204530520">
            +49 152 045 30520
          </a>
        </p>
      </section>
    </section>
  )
}
