'use client';

import { Sandpack } from '@codesandbox/sandpack-react';

const files = {
  '/App.js': `import "./styles.css";
import { useState } from "react";

export default function App() {
  const [toasts, setToasts] = useState(0);

  return (
    <div className="wrapper">
      <div className="toaster">
        {Array.from({ length: toasts }).map((_, i) => (
          <Toast key={i} />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          setToasts(toasts + 1);
        }}
      >
        Add toast
      </button>
    </div>
  );
}

function Toast() {
  return (
    <div className="toast" >
      <span className="title">테스트 타이틀</span>
      <span className="description">테스트 설명입니다.</span>
    </div>
  );
}`,
};

const files1 = {
  ...files,
  '/styles.css': `
.toast {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08); 
}

.title {
  font-weight: 600;             
  color: #111827;               
}

.description {
  line-height: 1.2;             
  color: #6b7280;               
  font-weight: 400;             
}

.toaster {
  position: absolute;
  bottom: 96px;                 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  --gap: 18px;                  
  width: 356px;
}

.button {
  position: relative;
  display: inline-block;
  margin-top: auto;
  width: auto;
  height: 36px;                 
  padding-inline: 14px;         
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  border-radius: 9999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0 3px 3px rgba(0, 0, 0, 0.04); 
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  height: 440px;                
}
`,
};
const files2 = {
  ...files,
  '/styles.css': `
.toast {
  position: absolute;
  bottom: 0;     
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08); 
}

.title {
  font-weight: 600;             
  color: #111827;               
}

.description {
  line-height: 1.2;             
  color: #6b7280;               
  font-weight: 400;             
}

.toaster {
  position: absolute;
  bottom: 96px;                 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  --gap: 18px;                  
  width: 356px;
}

.button {
  position: relative;
  display: inline-block;
  margin-top: auto;
  width: auto;
  height: 36px;                 
  padding-inline: 14px;         
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  border-radius: 9999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0 3px 3px rgba(0, 0, 0, 0.04); 
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  height: 440px;                
}
`,
};
const files3 = {
  '/App.js': `import "./styles.css";
import { useState } from "react";

export default function App() {
  const [toasts, setToasts] = useState(0);

  return (
    <div className="wrapper">
      <div className="toaster">
        {Array.from({ length: toasts }).map((_, i) => (
          <Toast key={i} index={toasts - (i + 1)} />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          setToasts(toasts + 1);
        }}
      >
        Add toast
      </button>
    </div>
  );
}

function Toast({index}) {
  return (
    <div className="toast" style={{"--index": index}} >
      <span className="title">테스트 타이틀</span>
      <span className="description">테스트 설명입니다.</span>
    </div>
  );
}`,
  '/styles.css': `
.toast {
  position: absolute;
  bottom: 0;     
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(calc(var(--index) * (5% + var(--gap)) * -1));
}

.title {
  font-weight: 600;             
  color: #111827;               
}

.description {
  line-height: 1.2;             
  color: #6b7280;               
  font-weight: 400;             
}

.toaster {
  position: absolute;
  bottom: 96px;                 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  --gap: 18px;                  
  width: 356px;
}

.button {
  position: relative;
  display: inline-block;
  margin-top: auto;
  width: auto;
  height: 36px;                 
  padding-inline: 14px;         
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  border-radius: 9999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0 3px 3px rgba(0, 0, 0, 0.04); 
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  height: 440px;                
}
`,
};
const files4 = {
  '/App.js': `import "./styles.css";
import { useState, useEffect } from "react";

export default function App() {
  const [toasts, setToasts] = useState(0);

  return (
    <div className="wrapper">
      <div className="toaster">
        {Array.from({ length: toasts }).map((_, i) => (
          <Toast key={i} index={toasts - (i + 1)} />
        ))}
      </div>
      <button
        className="button"
        onClick={() => {
          setToasts(toasts + 1);
        }}
      >
        Add toast
      </button>
    </div>
  );
}

function Toast({index}) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {setIsMounted(true)}, [])

  return (
    <div className="toast" data-open={isMounted} style={{"--index": index}} >
      <span className="title">테스트 타이틀</span>
      <span className="description">테스트 설명입니다.</span>
    </div>
  );
}`,
  '/styles.css': `
.toast {
  position: absolute;
  bottom: 0;     
  display: flex;
  flex-direction: column;
  gap: 6px;                     
  padding: 12px 16px 14px;      
  width: 100%;
  font-size: 14px;              
  border-radius: 8px;
  background: #fff;             
  border-left: 4px solid #6366f1; 
  box-shadow:
    0 1px 2px rgba(0, 0, 0, 0.06),
    0 4px 12px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transition: transform 400ms ease, opacity 400ms ease;
}
.toast[data-open="true"] {
  opacity: 1;
  transform: translateY(calc(var(--index) * (5% + var(--gap)) * -1));
}

.title {
  font-weight: 600;             
  color: #111827;               
}

.description {
  line-height: 1.2;             
  color: #6b7280;               
  font-weight: 400;             
}

.toaster {
  position: absolute;
  bottom: 96px;                 
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  gap: var(--gap);
  --gap: 18px;                  
  width: 356px;
}

.button {
  position: relative;
  display: inline-block;
  margin-top: auto;
  width: auto;
  height: 36px;                 
  padding-inline: 14px;         
  font-size: 14px;
  font-weight: 500;
  background: #fff;
  border-radius: 9999px;
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.08),
    0 3px 3px rgba(0, 0, 0, 0.04); 
}

.wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 24px;
  height: 440px;                
}
`,
};

export const SonnerImpl1 = () => {
  return (
    <Sandpack files={files1} template="react" options={{ editorHeight: 500 }} />
  );
};

export const SonnerImpl2 = () => {
  return (
    <Sandpack files={files2} template="react" options={{ editorHeight: 500 }} />
  );
};

export const SonnerImpl3 = () => {
  return (
    <Sandpack files={files3} template="react" options={{ editorHeight: 500 }} />
  );
};

export const SonnerImpl4 = () => {
  return (
    <Sandpack files={files4} template="react" options={{ editorHeight: 500 }} />
  );
};
