import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { ChatMessage, AttachmentMeta } from "../../types/chat";
import { MessageActions } from "./MessageActions";
import { ToolCallComponent } from "./ToolCallComponent";
import { IconPaperclip, IconCopy, IconCheck, IconEdit } from "../ui/icons";

interface MessageBubbleProps {
  message: ChatMessage;
  onCopy: () => void;
  onBranchOff: (message: ChatMessage) => void;
  onRetry: (message: ChatMessage) => void;
  onPreviewAttachment: (att: AttachmentMeta) => void;
  onEditUser: (message: ChatMessage, newText: string) => void;
}

// Languages that should render with the code "card" UI (with copy controls)
const CODE_CARD_LANGS: Set<string> = new Set([
  // From user list
  "cucumber",
  "abap",
  "ada",
  "ahk",
  "ahkl",
  "apacheconf",
  "applescript",
  "as",
  "as3",
  "asy",
  "bash",
  "ksh",
  "bashrc",
  "ebuild",
  "eclass",
  "bat",
  "cmd",
  "befunge",
  "blitzmax",
  "boo",
  "brainfuck",
  "c",
  "h",
  "cfm",
  "cfml",
  "cfc",
  "cheetah",
  "tmpl",
  "spt",
  "cl",
  "lisp",
  "el",
  "clojure",
  "clj",
  "cljs",
  "cmake",
  "coffeescript",
  "coffee",
  "console",
  "sh-session",
  "control",
  "cpp",
  "hpp",
  "c++",
  "h++",
  "cc",
  "hh",
  "cxx",
  "hxx",
  "pde",
  "csharp",
  "cs",
  "css",
  "cython",
  "pyx",
  "pxd",
  "pxi",
  "d",
  "di",
  "delphi",
  "pas",
  "diff",
  "patch",
  "dpatch",
  "darcspatch",
  "duel",
  "jbst",
  "dylan",
  "dyl",
  "erb",
  "erl-sh",
  "erlang",
  "erl",
  "hrl",
  "evoque",
  "factor",
  "felix",
  "flx",
  "flxh",
  "fortran",
  "f",
  "f90",
  "gas",
  "s",
  "S",
  "genshi",
  "kid",
  "gitignore",
  "glsl",
  "vert",
  "frag",
  "geo",
  "gnuplot",
  "plot",
  "plt",
  "go",
  "groff",
  "man",
  "haml",
  "haskell",
  "hs",
  "html",
  "htm",
  "xhtml",
  "xslt",
  "hx",
  "hybris",
  "hy",
  "hyb",
  "ini",
  "cfg",
  "io",
  "ioke",
  "ik",
  "irc",
  "weechatlog",
  "jade",
  "java",
  "js",
  "jsp",
  "lhs",
  "llvm",
  "ll",
  "logtalk",
  "lgt",
  "lua",
  "wlua",
  "make",
  "mak",
  "makefile",
  "GNUmakefile",
  "mako",
  "mao",
  "maql",
  "mason",
  "mhtml",
  "mc",
  "mi",
  "autohandler",
  "dhandler",
  "markdown",
  "md",
  "modelica",
  "mo",
  "modula2",
  "def",
  "mod",
  "moocode",
  "moo",
  "mupad",
  "mu",
  "mxml",
  "myghty",
  "myt",
  "autodelegate",
  "nasm",
  "asm",
  "ASM",
  "newspeak",
  "ns2",
  "objdump",
  "objectivec",
  "m",
  "objectivej",
  "j",
  "ocaml",
  "ml",
  "mli",
  "mll",
  "mly",
  "ooc",
  "perl",
  "pl",
  "pm",
  "php",
  "php3",
  "php4",
  "php5",
  "postscript",
  "ps",
  "eps",
  "pot",
  "po",
  "pov",
  "inc",
  "prolog",
  "pro",
  "properties",
  "proto",
  "protobuf",
  "py3tb",
  "pytb",
  "python",
  "py",
  "pyw",
  "sc",
  "SConstruct",
  "SConscript",
  "tac",
  "r",
  "R",
  "rb",
  "rbw",
  "Rakefile",
  "rake",
  "gemspec",
  "rbx",
  "duby",
  "rconsole",
  "Rout",
  "rebol",
  "r3",
  "redcode",
  "cw",
  "rhtml",
  "rst",
  "rest",
  "sass",
  "scala",
  "scaml",
  "scheme",
  "scm",
  "scss",
  "smalltalk",
  "st",
  "smarty",
  "tpl",
  "sourceslist",
  "sources.list",
  "splus",
  "S",
  "sql",
  "sqlite3",
  "sqlite3-console",
  "squidconf",
  "squid.conf",
  "ssp",
  "tcl",
  "tcsh",
  "csh",
  "tex",
  "aux",
  "toc",
  "v",
  "sv",
  "vala",
  "vapi",
  "vbnet",
  "vb",
  "bas",
  "velocity",
  "vm",
  "fhtml",
  "vim",
  "vimrc",
  "xml",
  "xsl",
  "rss",
  "xsd",
  "wsdl",
  "xquery",
  "xqy",
  "xslt",
  "yaml",
  "yml",
  // Explicit additions
  "typescript",
  "ts",
  "tsx",
  "javascript",
  "jsx",
  "shell",
  "sh",
  "zsh",
  "powershell",
  "ps1",
]);

// Copy button used inside code-block cards
function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      const t = setTimeout(() => setCopied(false), 1200);
      return () => clearTimeout(t);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded border border-blue-300/70 bg-white/70 px-2 py-0.5 text-[11px] text-blue-700 hover:bg-white"
      title={copied ? "Copied" : "Copy to clipboard"}
    >
      <span className="text-blue-500">
        {copied ? <IconCheck /> : <IconCopy />}
      </span>
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function MessageBubble({
  message,
  onCopy,
  onBranchOff,
  onRetry,
  onPreviewAttachment,
  onEditUser,
}: MessageBubbleProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editText, setEditText] = React.useState(message.content || "");

  React.useEffect(() => {
    // keep local copy in sync if message changes
    setEditText(message.content || "");
  }, [message.id, message.content]);

  const startEditing = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditText(message.content || "");
    setIsEditing(true);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditText(message.content || "");
  };

  const submitEditing = async (e?: React.MouseEvent) => {
    e?.stopPropagation();
    const next = (editText || "").trim();
    if (!next) return; // ignore empty edits
    setIsEditing(false);
    onEditUser(message, next);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (ev) => {
    if ((ev.metaKey || ev.ctrlKey) && ev.key === "Enter") {
      submitEditing();
    } else if (ev.key === "Escape") {
      cancelEditing();
    }
  };
  return (
    <div
      className={`flex ${
        message.role === "user" ? "justify-end" : "justify-start"
      } mb-4 md:mb-5`}
    >
      <div
        className={`max-w-[100%] ${
          message.role === "user" ? "flex justify-end" : ""
        }`}
      >
        {/* Tool calls (only for assistant messages) */}
        {message.role === "assistant" &&
          message.toolCalls &&
          message.toolCalls.length > 0 && (
            <div className="mb-3 w-full">
              {message.toolCalls.map((toolCall) => {
                const toolResult = message.toolResults?.find(
                  (tr) => tr.toolCallId === toolCall.toolCallId,
                );
                return (
                  <ToolCallComponent
                    key={toolCall.toolCallId}
                    toolCall={toolCall}
                    toolResult={toolResult}
                  />
                );
              })}
            </div>
          )}

        {/* Message content */}
        {message.content && (
          <div className="w-full">
            <div
              className={`${
                message.role === "user"
                  ? "bg-[#eff6ff] text-[#1e3a8a]"
                  : "bg-[#f8fbff] text-blue-900"
              } ${message.role === "user" ? "whitespace-pre-wrap" : "whitespace-normal"} rounded-2xl px-4 py-3 relative group`}
            >
              {message.role === "assistant" ? (
                <div className="prose chat-markdown max-w-none whitespace-normal leading-7 space-y-3 prose-headings:text-blue-900 prose-p:text-blue-900 prose-li:text-blue-900 prose-strong:text-blue-900 prose-pre:bg-blue-100 prose-pre:text-blue-800 prose-headings:mt-4 prose-headings:mb-1 prose-p:my-0 prose-li:my-1 prose-ul:my-0 prose-ol:my-0 prose-ul:pl-5 prose-ol:pl-5 prose-pre:my-3 prose-code:before:content-none prose-code:after:content-none prose-code:px-0 prose-code:py-0 prose-code:mr-0 prose-code:ml-0 prose-code:bg-blue-50 prose-code:rounded">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks]}
                    components={{
                      // Wrap fenced code blocks in a card with copy control
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      code({
                        node,
                        inline,
                        className,
                        children,
                        ...props
                      }: any) {
                        const match = /language-([A-Za-z0-9_+-]+)/.exec(
                          className || "",
                        );
                        const rawLang = (match?.[1] || "").trim().toLowerCase();
                        const lang = rawLang;
                        const raw = String(children || "");
                        const content = raw.endsWith("\n")
                          ? raw.slice(0, -1)
                          : raw;

                        if (inline) {
                          return (
                            <code
                              className={`text-[#7b3f00] whitespace-normal ${className || ""}`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        }

                        // If language indicates plain text (or no language), render simple brown text
                        if (
                          !lang ||
                          lang === "text" ||
                          lang === "txt" ||
                          lang === "plain" ||
                          lang === "plaintext"
                        ) {
                          return (
                            <span className="inline-flex flex-wrap items-center rounded-[5px] bg-blue-50 px-2.5 py-0.5 text-xs font-semibold whitespace-normal break-words max-w-[320px]">
                              {content}
                            </span>
                          );
                        }

                        // Only show the card when an explicit, allowed language is present
                        const hasExplicitLang = Boolean(match && match[1]);
                        const showCard =
                          hasExplicitLang && CODE_CARD_LANGS.has(lang);
                        if (showCard) {
                          return (
                            <div
                              className="group my-2 overflow-hidden rounded-lg border border-blue-200 bg-white/90"
                              onClick={() =>
                                navigator.clipboard.writeText(content)
                              }
                              role="button"
                              tabIndex={0}
                            >
                              <div className="flex items-center justify-between bg-blue-50 px-3 py-1.5 text-xs text-blue-700">
                                <span className="font-medium">
                                  {lang || "text"}
                                </span>
                                <CopyButton content={content} />
                              </div>
                              <pre className="overflow-auto p-3 text-[12px] leading-5 m-0 whitespace-pre-wrap">
                                <code className={className} {...props}>
                                  {content}
                                </code>
                              </pre>
                            </div>
                          );
                        }

                        // Fallback: plain code block without card/copy for other unknown languages
                        return (
                          <pre className="my-2 overflow-auto p-3 text-[12px] leading-5 bg-blue-100 text-blue-800 rounded">
                            <code className={className} {...props}>
                              {content}
                            </code>
                          </pre>
                        );
                      },
                      // Open links in new tab safely
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      a({ href, children, ...props }: any) {
                        const isExternal =
                          typeof href === "string" &&
                          /^(https?:)?\/\//.test(href);
                        return (
                          <a
                            href={href}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            {...props}
                          >
                            {children}
                          </a>
                        );
                      },
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              ) : message.role === "user" ? (
                isEditing ? (
                  <div>
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={onKeyDown}
                      autoFocus
                      rows={Math.min(12, Math.max(3, Math.ceil((editText.length || 1) / 60)))}
                      className="w-full resize-y rounded-lg border border-blue-200 bg-white/90 px-3 py-2 text-sm text-blue-900 outline-none focus:border-blue-400"
                      placeholder="Edit your message"
                    />
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={submitEditing}
                        disabled={!editText.trim()}
                        className="inline-flex items-center gap-1 rounded-md bg-[#2563eb] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
                      >
                        <span className="text-white"><IconCheck /></span>
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Normal user message text */}
                    {message.content}
                    {/* Edit button on hover */}
                    <button
                      type="button"
                      onClick={startEditing}
                      title="Edit message"
                      className="absolute right-1 top-1 hidden items-center gap-1 rounded-md border border-blue-200 bg-white/90 px-2 py-1 text-[10px] text-blue-700 shadow-sm hover:bg-white group-hover:flex"
                    >
                      <span className="text-blue-600"><IconEdit /></span>
                      Edit
                    </button>
                  </>
                )
              ) : (
                message.content
              )}
            </div>

            {/* Attachment chips (only for user messages with attachments) */}
            {message.role === "user" &&
              Array.isArray(message.attachments) &&
              message.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-blue-900/90">
                  {message.attachments.map((att, idx) => (
                    <span
                      key={`${att.name}-${idx}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => onPreviewAttachment(att)}
                      className="inline-flex items-center gap-1 rounded-full border border-blue-200/60 bg-white/70 px-2.5 py-1 cursor-pointer hover:bg-white"
                    >
                      <span className="text-blue-500">
                        <IconPaperclip />
                      </span>
                      {att.name}
                    </span>
                  ))}
                </div>
              )}

            {/* Message Actions - only for assistant messages */}
            {message.role === "assistant" && (
              <MessageActions
                message={message}
                onCopy={onCopy}
                onBranchOff={() => onBranchOff(message)}
                onRetry={() => onRetry(message)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
