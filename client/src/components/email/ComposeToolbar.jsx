import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  Image,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Smile,
} from "lucide-react";

const tools = [
  { icon: Bold, command: "bold" },
  { icon: Italic, command: "italic" },
  { icon: Underline, command: "underline" },
  { icon: List, command: "insertUnorderedList" },
  { icon: ListOrdered, command: "insertOrderedList" },
  { icon: AlignLeft, command: "justifyLeft" },
  { icon: AlignCenter, command: "justifyCenter" },
  { icon: AlignRight, command: "justifyRight" },
];

export default function ComposeToolbar() {
  const execute = (command) => {
    document.execCommand(command, false, null);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-900">
      {tools.map(({ icon: Icon, command }) => (
        <button
          key={command}
          type="button"
          onClick={() => execute(command)}
          className="rounded-md p-2 transition hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <Icon size={16} />
        </button>
      ))}

      <div className="mx-2 h-5 w-px bg-gray-300 dark:bg-gray-700" />

      <button
        type="button"
        className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Link size={16} />
      </button>

      <button
        type="button"
        className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Image size={16} />
      </button>

      <button
        type="button"
        className="rounded-md p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Smile size={16} />
      </button>
    </div>
  );
}