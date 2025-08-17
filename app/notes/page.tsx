import { createClient } from "@/lib/supabase/server"

export default async function Notes() {
  const supabase = await createClient()

  try {
    const { data: notes, error } = await supabase.from("notes").select("*").order("created_at", { ascending: false })

    if (error) {
      return (
        <div className="container mx-auto p-8">
          <h1 className="text-2xl font-bold mb-4">Notes</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">Error loading notes: {error.message}</p>
            <p className="text-sm text-red-600 mt-2">Make sure the notes table exists in your Supabase database.</p>
          </div>
        </div>
      )
    }

    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Notes</h1>

        {!notes || notes.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">No notes found.</p>
            <p className="text-sm text-yellow-600 mt-2">Run the Supabase verification script to create sample notes.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note: any) => (
              <div key={note.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 className="font-medium text-gray-900">{note.title}</h3>
                <p className="text-sm text-gray-500 mt-1">Created: {new Date(note.created_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="font-medium text-gray-900 mb-2">Raw Data:</h2>
          <pre className="text-sm text-gray-600 overflow-auto">{JSON.stringify(notes, null, 2)}</pre>
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container mx-auto p-8">
        <h1 className="text-2xl font-bold mb-4">Notes</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Connection error: {error.message}</p>
        </div>
      </div>
    )
  }
}
