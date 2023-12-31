<template>
  <div class="flex w-screen h-screen text-gray-700">
    <div v-if="isOffline" class="w-screen absolute bg-orange-200 text-center py-1">
      Sorry, it looks like your internet is down!

      {{ isOffline }}
    </div>

    <div class="flex flex-col flex-shrink-0 w-64 border-r border-gray-300 bg-gray-100">
      <!-- sidebar -->
      <div class="h-0 overflow-auto flex-grow">
        <button class="add-note" @click="showAllNotes">all notes</button>
        <button class="add-note" @click="addNewNote">+</button>

        <div class="mt-4">
          <a 
            href="#" 
            class="flex items-center h-8 text-sm pl-8 pr-3"
            v-for="note in notes"
            :key="note.created"
            @click.prevent="openNote(note)"
          >
            <span class="ml-2 leading-none">{{ new Date(note.created).toLocaleString() }}</span>
          </a>
        </div>
      </div>
    </div>

    <div class="flex flex-col flex-grow">
      <!-- main content -->
      <div class="flex flex-col flex-grow overflow-auto">
        <div v-if="activeNote">
          <editor-content :editor="editor" />
        </div>

        <div v-else class="flex flex-col flex-grow px-4 pt-3 pb-4">
          <div v-for="note in notes" :key="note.created">
            <div class="prose my-2 mx-auto">
              <div class="flex flex-col flex-grow mx-auto">
                <span class="text-muted text-sm">Created on {{ new Date(note.created).toLocaleString() }}</span>
              </div>
            
              <div v-html="note.content"></div>
            </div>

            <hr class="w-full">
          </div>
        </div>
      </div>

      <div class="h-16 bg-gray-100 border-t border-gray-300 text-right" v-if="activeNote">
        <button @click.prevent="saveNote" class="save-button">
          Save Note
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { Editor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';

export default {
  name: 'App',
  components: {
    EditorContent
  },
  data() {
    return { 
      editor: null,
      database: null,
      notes: [],
      activeNote: null,
      isOffline: ! navigator.onLine,
    };
  },
  async created() {
    this.database = await this.getDatabase()
    this.notes = await this.getNotes();
  },
  mounted() {
    this.editor = new Editor({
      content: '',
      extensions: [
        StarterKit,
      ],
      editorProps: {
        attributes: {
          class: "prose my-6 mx-auto focus:outline-none border-b border-grey-400"
        }
      }
    })

    window.addEventListener('offline', () => {
      this.isOffline = true;
    })

    window.addEventListener('online', () => {
      this.isOffline = false;

      this.syncUserData();
    })
  },
  beforeUnmount() {
    this.editor.destroy();
  },
  methods: {
    async getDatabase() {
      return new Promise((resolve, reject) => {
        let db = window.indexedDB.open("notes");

        db.onerror = e => {
          reject('error opening the database', e)
        }

        db.onsuccess = e => {
          console.log('db.onsuccess', e)
          resolve(e.target.result)
        }

        db.onupgradeneeded = e => {
          console.log('db.onupgradeneeded', e)
          // e.target.result.deleteObjectStore("notes")
          e.target.result.createObjectStore("notes", { keyPath: "created" })
        }
      })
    },  
    async saveNote() {
      return new Promise(async (resolve, reject) => {
        let noteRequest = this.database.transaction('notes', 'readwrite')
          .objectStore('notes')
          .get(this.activeNote.created);

          noteRequest.onerror = e => {
            reject('Error saving the note in the database')
          }

          noteRequest.onsuccess = e => {
            let note = e.target.result;

            note.content = this.editor.getHTML();

            let updateRequest = this.database.transaction('notes', 'readwrite')
              .objectStore('notes')
              .put(note);

            updateRequest.onerror = e => {
              reject('error sroting the updated note in the database')
            }

            updateRequest.onsuccess = e => {
              const noteIndex = this.notes.findIndex(n => n.created === note.created)
              this.notes[noteIndex] = note;

              resolve();
            }
          }
      })
    },
    async getNotes() {
      return new Promise((resolve, reject) => {
        this.database
          .transaction('notes')
          .objectStore('notes')
          .getAll()
          .onsuccess = e => {
            console.log('getnotes', e)
            resolve(e.target.result);
          };
      })
    },
    openNote(note) {
      this.editor.commands.setContent(note.content);
      this.activeNote = note;
    },
    showAllNotes() {
      this.editor.commands.clearContent();
      this.activeNote = null;
    },
    addNewNote() {
      return new Promise(async (resolve, reject) => {
        let transaction = this.database.transaction(['notes'], 'readwrite')

        transaction.oncomplete = e => {
          resolve();
        }

        const note = {
          content: '',
          created: new Date().getTime(),
        }

        this.notes.unshift(note);

        this.activeNote = note;
        transaction.objectStore('notes').add(note)
      })      
    
    },  
    syncUserData() {
      if (this.ifOffline) return;


    }
  }
} 
</script>

<style>
.save-button {
  @apply bg-gray-700 text-white px-4 py-2 rounded;
}

.save-button:hover {
  @apply bg-gray-600;
}
</style>
