// components/CustomTiptapEditor.tsx
'use client'; // এটি অপরিহার্য, এটি একটি ক্লায়েন্ট কম্পোনেন্ট হিসেবে চিহ্নিত করবে

import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';

// যদি আপনার কোনো কাস্টম CSS স্টাইল থাকে Tiptap এডিটরের জন্য,
// আপনি এখানে ইম্পোর্ট করতে পারেন, যেমন:
// import './CustomTiptapEditor.module.css';
// অথবা, আপনি Tailwind CSS ক্লাস ব্যবহার করতে পারেন, যা এই কোডে করা হয়েছে।

interface CustomTiptapEditorProps {
  initialContent: string; // এডিটরের প্রাথমিক কন্টেন্ট (HTML স্ট্রিং)
  onContentChange: (html: string) => void; // কন্টেন্ট পরিবর্তন হলে কলব্যাক ফাংশন
}

// এটি এডিটরের টুলবার কম্পোনেন্ট
const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null; // এডিটর ইনিশিয়ালাইজ না হলে টুলবার দেখাবে না
  }

  // বাটনগুলোর জন্য বেসিক Tailwind CSS ক্লাস
  const buttonClass = "p-2 border border-gray-300 rounded m-1 text-sm transition-colors duration-200 ease-in-out";
  const activeClass = "bg-blue-500 text-white hover:bg-blue-600";
  const inactiveClass = "bg-white text-gray-700 hover:bg-gray-100";

  // লিঙ্কের জন্য প্রম্পট ফাংশন
  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL দিন', previousUrl);

    // যদি প্রম্পট বাতিল করা হয়
    if (url === null) {
      return;
    }

    // যদি URL খালি হয়, লিংক মুছে দিন
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // নতুন লিংক সেট করুন
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap border border-gray-300 p-2 mb-2 rounded-md shadow-sm bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`${buttonClass} ${editor.isActive('bold') ? activeClass : inactiveClass}`}
        title="Bold"
      >
        **B**
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`${buttonClass} ${editor.isActive('italic') ? activeClass : inactiveClass}`}
        title="Italic"
      >
        *I*
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`${buttonClass} ${editor.isActive('underline') ? activeClass : inactiveClass}`}
        title="Underline"
      >
        <u>U</u>
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`${buttonClass} ${editor.isActive('strike') ? activeClass : inactiveClass}`}
        title="Strikethrough"
      >
        <s>S</s>
      </button>
      <button
        onClick={setLink}
        className={`${buttonClass} ${editor.isActive('link') ? activeClass : inactiveClass}`}
        title="Set Link"
      >
        🔗 Link
      </button>
      <button
        onClick={() => editor.chain().focus().unsetLink().run()}
        disabled={!editor.isActive('link')}
        className={`${buttonClass} ${!editor.isActive('link') ? 'cursor-not-allowed opacity-50' : inactiveClass}`}
        title="Unlink"
      >
        🔗 Unlink
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`${buttonClass} ${editor.isActive('code') ? activeClass : inactiveClass}`}
        title="Code"
      >
        `Code`
      </button>

      {/* Heading options */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 1 }) ? activeClass : inactiveClass}`}
        title="Heading 1"
      >
        H1
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 2 }) ? activeClass : inactiveClass}`}
        title="Heading 2"
      >
        H2
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`${buttonClass} ${editor.isActive('heading', { level: 3 }) ? activeClass : inactiveClass}`}
        title="Heading 3"
      >
        H3
      </button>

      {/* List options */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`${buttonClass} ${editor.isActive('bulletList') ? activeClass : inactiveClass}`}
        title="Bullet List"
      >
        • List
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`${buttonClass} ${editor.isActive('orderedList') ? activeClass : inactiveClass}`}
        title="Ordered List"
      >
        1. List
      </button>

      {/* Alignment options */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`${buttonClass} ${editor.isActive({ textAlign: 'left' }) ? activeClass : inactiveClass}`}
        title="Align Left"
      >
        Left
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`${buttonClass} ${editor.isActive({ textAlign: 'center' }) ? activeClass : inactiveClass}`}
        title="Align Center"
      >
        Center
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`${buttonClass} ${editor.isActive({ textAlign: 'right' }) ? activeClass : inactiveClass}`}
        title="Align Right"
      >
        Right
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`${buttonClass} ${editor.isActive({ textAlign: 'justify' }) ? activeClass : inactiveClass}`}
        title="Justify"
      >
        Justify
      </button>

      {/* Highlight option */}
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`${buttonClass} ${editor.isActive('highlight') ? activeClass : inactiveClass}`}
        title="Highlight"
      >
        🖍️ Highlight
      </button>

      {/* Undo/Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className={`${buttonClass} ${!editor.can().undo() ? 'cursor-not-allowed opacity-50' : inactiveClass}`}
        title="Undo"
      >
        ↩️ Undo
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className={`${buttonClass} ${!editor.can().redo() ? 'cursor-not-allowed opacity-50' : inactiveClass}`}
        title="Redo"
      >
        ↪️ Redo
      </button>
    </div>
  );
};

// এটি আপনার প্রধান Tiptap Editor কম্পোনেন্ট
export function CustomTiptapEditor({ initialContent, onContentChange }: CustomTiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit, // বেসিক এক্সটেনশন যেমন প্যারাগ্রাফ, বোল্ড, ইটালিক, কোড ইত্যাদি
      Underline,  // আন্ডারলাইন যোগ করতে
      Link.configure({
        openOnClick: false, // লিঙ্কে ক্লিক করলে এডিটর মোডে না খুলে নতুন ট্যাবে খুলবে
      }),
      Highlight, // হাইলাইট টেক্সট
      TextAlign.configure({
        types: ['heading', 'paragraph'], // হেডিং এবং প্যারাগ্রাফে টেক্সট অ্যালাইনমেন্ট
      }),
      // আপনার প্রয়োজন অনুযায়ী অন্যান্য Tiptap এক্সটেনশন এখানে যোগ করুন
      // যেমন: Image, Table, CodeBlock ইত্যাদি
    ],
    content: initialContent, // এডিটর ইনিশিয়ালাইজ করার সময় প্রাথমিক কন্টেন্ট সেট করুন
    onUpdate: ({ editor }) => {
      // যখন এডিটরের কন্টেন্ট আপডেট হবে, তখন এই কলব্যাক ফাংশনটি HTML কন্টেন্ট ফেরত দেবে
      onContentChange(editor.getHTML());
    },
    // !!! এই লাইনটি যোগ করা হয়েছে Tiptap এরর মেসেজ অনুযায়ী !!!
    // এটি Tiptap কে বলে যে সার্ভার-সাইডে রেন্ডার করার চেষ্টা না করে ক্লায়েন্ট-সাইডেই রেন্ডার শুরু করতে।
    immediatelyRender: false,
  });

  // এডিটর পুরোপুরি লোড না হওয়া পর্যন্ত একটি লোডিং স্টেট দেখান (গুরুত্বপূর্ণ)
  if (!editor) {
    return <div className="p-4 border rounded-md text-gray-500">Loading editor...</div>;
  }

  return (
    <div className="border border-gray-300 rounded-md p-4 bg-white shadow-sm">
      <MenuBar editor={editor} />
      {/* EditorContent কম্পোনেন্টটি যেখানে এডিটরের actual টেক্সট এরিয়া থাকবে */}
      <EditorContent editor={editor} className="min-h-[200px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
      {/*
        এখানে আপনি Tiptap এর জন্য কিছু ডিফল্ট স্টাইল যোগ করতে পারেন,
        যেমন: ul, ol, h1, p ট্যাগগুলোর জন্য।
        অথবা, আপনার গ্লোবাল CSS ফাইলে (globals.css) Tiptap এর জন্য বেসিক স্টাইল যোগ করতে পারেন।
        যেমন:
        .ProseMirror { /* Tiptap এর কন্টেন্ট এরিয়া */
        /* outline: none; */
        /* } */
        /* .ProseMirror p { */
        /* margin: 0 0 1em 0; */
        /* } */
        /* .ProseMirror ul, .ProseMirror ol { */
        /* padding-left: 1.5em; */
        /* margin-bottom: 1em; */
        /* } */
        /* .ProseMirror h1, .ProseMirror h2, .ProseMirror h3 { */
        /* margin-top: 1em; */
        /* margin-bottom: 0.5em; */
        /* */} 
      </div>
  );
}