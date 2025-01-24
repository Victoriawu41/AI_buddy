import hljs from 'highlight.js'
import { FC, memo, useEffect, useRef } from 'react'

interface Props {
  language: string
  value: string
  className?: string
}

const CodeBlock: FC<Props> = memo(({ language, value, className }) => {
  const codeRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (codeRef.current && codeRef.current.dataset.highlighted !== 'yes') {
      hljs.highlightElement(codeRef.current)
    }
  }, [language, value])

  return (
    <div className={`codeblock relative w-full bg-zinc-950 font-sans ${className}`}>
      <pre className="border border-zinc-700 text-white">
        <code ref={codeRef} className={`language-${language} font-mono`}>
          {value}
        </code>
      </pre>
    </div>
  )
})
CodeBlock.displayName = 'CodeBlock'

export { CodeBlock }