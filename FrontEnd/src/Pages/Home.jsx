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

  const reviewCode = async () => {
    setReview("");
    setIsLoading(true);

    try {
      console.log("Sending Code:", code);

      const { data } = await axios.post(
        "http://localhost:3000/ai/get-review",
        { code }
      );

      console.log("Response:", data);

      // ✅ SAFE FIX (IMPORTANT)~
      setReview(data);

    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      setReview("Error while analyzing code ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <main>
        {/* LEFT SIDE */}
        <div className="left">
          <select
            onChange={(e) => setLanguage(e.target.value)}
            value={language}
          >
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
                  : Prism.highlight(
                      code,
                      Prism.languages.javascript,
                      "javascript"
                    )
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

          <button className="review" onClick={reviewCode}>
            {isLoading ? "Analyzing..." : "Analyze"}
          </button>
        </div>

        {/* RIGHT SIDE */}
        <div className="right">
          <div className={`loader ${isLoading ? "show" : ""}`}></div>

          {/* ✅ SAFE Markdown render */}
          <Markdown rehypePlugins={[rehypeHighlight]}>
            {review}
          </Markdown>
        </div>
      </main>
    </>
  );
}

export default Home;