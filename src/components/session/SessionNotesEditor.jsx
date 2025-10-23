// src/components/session/SessionNotesEditor.jsx

export default function SessionNotesEditor({ notes, onChange }) {
    return (
        <section className="mb-8">
            <label htmlFor="sessionNotes" className="text-xl font-semibold mb-3 block">Notatki do sesji</label>
            <textarea
                id="sessionNotes"
                value={notes || ''}
                onChange={onChange}
                placeholder="Dodaj notatki do całej sesji..."
                className="w-full p-4 bg-surfaceDarkGray border border-borderGrayHover rounded-lg focus:ring-2 focus:ring-bluePrimary h-28"
            />
        </section>
    );
}