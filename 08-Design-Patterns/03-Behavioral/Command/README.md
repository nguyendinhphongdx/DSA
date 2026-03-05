# Command Pattern

## 1. Khái niệm

Đóng gói **request** thành object, cho phép parameterize, queue, log, và **undo/redo** operations.

```
Client ──→ Command ──→ Receiver
           ┌──────────────┐
           │   Command     │
           │ + execute()   │
           │ + undo()      │
           └──────────────┘
```

---

## 2. Ví dụ: Text Editor với Undo/Redo

```javascript
// Command interface
class Command {
  execute() { throw new Error('Must implement'); }
  undo() { throw new Error('Must implement'); }
}

class InsertTextCommand extends Command {
  constructor(editor, text, position) {
    super();
    this.editor = editor;
    this.text = text;
    this.position = position;
  }

  execute() {
    this.editor.insertAt(this.position, this.text);
  }

  undo() {
    this.editor.deleteAt(this.position, this.text.length);
  }
}

class DeleteTextCommand extends Command {
  constructor(editor, position, length) {
    super();
    this.editor = editor;
    this.position = position;
    this.length = length;
    this.deletedText = '';
  }

  execute() {
    this.deletedText = this.editor.getTextAt(this.position, this.length);
    this.editor.deleteAt(this.position, this.length);
  }

  undo() {
    this.editor.insertAt(this.position, this.deletedText);
  }
}

// Receiver
class TextEditor {
  #content = '';

  insertAt(pos, text) {
    this.#content = this.#content.slice(0, pos) + text + this.#content.slice(pos);
  }

  deleteAt(pos, length) {
    this.#content = this.#content.slice(0, pos) + this.#content.slice(pos + length);
  }

  getTextAt(pos, length) { return this.#content.slice(pos, pos + length); }
  getContent() { return this.#content; }
}

// Invoker
class CommandHistory {
  #undoStack = [];
  #redoStack = [];

  execute(command) {
    command.execute();
    this.#undoStack.push(command);
    this.#redoStack = [];
  }

  undo() {
    const command = this.#undoStack.pop();
    if (command) {
      command.undo();
      this.#redoStack.push(command);
    }
  }

  redo() {
    const command = this.#redoStack.pop();
    if (command) {
      command.execute();
      this.#undoStack.push(command);
    }
  }
}

// Sử dụng
const editor = new TextEditor();
const history = new CommandHistory();

history.execute(new InsertTextCommand(editor, 'Hello ', 0));
history.execute(new InsertTextCommand(editor, 'World!', 6));
console.log(editor.getContent()); // 'Hello World!'

history.undo();
console.log(editor.getContent()); // 'Hello '

history.redo();
console.log(editor.getContent()); // 'Hello World!'
```

---

## 3. Ví dụ: Task Queue

```javascript
class TaskQueue {
  #queue = [];
  #isProcessing = false;

  add(command) {
    this.#queue.push(command);
    this.#process();
  }

  async #process() {
    if (this.#isProcessing) return;
    this.#isProcessing = true;

    while (this.#queue.length) {
      const command = this.#queue.shift();
      await command.execute();
    }

    this.#isProcessing = false;
  }
}
```

---

## 4. Khi nào dùng

- Undo/Redo functionality
- Task queue, job scheduler
- Macro commands (nhóm nhiều commands)
- Logging operations
- Transaction rollback

---

## 5. Bài tập

```javascript
// Tạo Calculator với undo/redo:
// - AddCommand, SubtractCommand, MultiplyCommand, DivideCommand
// - Mỗi command có execute() và undo()
// - Calculator giữ history và support undo/redo
```
