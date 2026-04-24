import React, { useState } from "react";
import axios from "axios";
import Editor from "react-simple-code-editor";
import Prism from "prismjs";
import Markdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";
import "prismjs/themes/prism-tomorrow.css";
import "../App.css";

function Home() {
  const [review, setReview] = useState("");
  const [code, setCode] = useState(`cout<<"WRITE YOUR CODE HERE";`);
  const [language, setLanguage] = useState("javascript");
  const [isLoading, setIsLoading] = useState(false);

  // ✅ File upload handler
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const text = await file.text(); // file ka text read karo
    setCode(text);                  // editor mai daal do
  };

  const reviewCode = async () => {
    setReview("");
    setIsLoading(true);
    try {
      const { data } = await axios.post("http://localhost:3000/ai/get-review", { code });
      setReview(data);
    } catch (error) {
      setReview("Error while analyzing code ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main>
        <div className="left">
          <select onChange={(e) => setLanguage(e.target.value)} value={language}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
            <option value="java">Java</option>
            <option value="html">HTML</option>
            <option value="react">React</option>
            <option value="css">CSS</option>
            <option value="r">R</option>
            <option value="react-native">React Native</option>
            <option value="c">C</option>
            <option value="dotnet">.NET Core</option>
            <option value="flutter">Flutter</option>
          </select>

          <div className="code">
            <Editor
              value={code}
              onValueChange={(code) => setCode(code)}
              highlight={(code) =>
                Prism.languages[language]
                  ? Prism.highlight(code, Prism.languages[language], language)
                  : Prism.highlight(code, Prism.languages.javascript, "javascript")
              }
              padding={10}
              style={{
                fontFamily: '"Fira Code", monospace',
                fontSize: 15,
                border: "1px solid #ddd",
                borderRadius: "5px",
                height: "auto",
                maxHeight: "calc(100vh - 100px)",
                width: "100%",
                overflow: "auto",
              }}
            />
          </div>

          {/* ✅ File Input + Analyze Button */}
          <input type="file" accept=".js,.jsx,.ts,.cpp,.c,.java,.py,.html,.css" onChange={handleFile} />
          <button className="review" onClick={reviewCode}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        <div className="right">
          <div className={`loader ${isLoading ? "show" : ""}`}></div>
          <Markdown rehypePlugins={[rehypeHighlight]}>{review}</Markdown>
        </div>
      </main>
    </>
  );
}

export default Home;