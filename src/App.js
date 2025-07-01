import React, { useState } from "react";

const API_URL = "https://seo-ai-proxy.onrender.com/generate";
const MODEL = "deepseek/deepseek-chat-v3-0324:free";

function App() {
  const [productName, setProductName] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [material, setMaterial] = useState("");
  const [extraInfo, setExtraInfo] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const stripSection = (text, sectionTitle) => {
    const pattern = new RegExp(
      `###\\s+\\*\\*?${sectionTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\*?\\*?.*?(?=\\n###|$)`,
      "gis"
    );
    return text.replace(pattern, "");
  };

  const generateSEO = async () => {
    setLoading(true);
    setOutput("");

    try {
      const memoryResponse = await fetch("/memory.txt");
      const memory = await memoryResponse.text();

      const dimensions = `Weight: ${weight} kg, Length: ${length} cm, Width: ${width} cm, Height: ${height} cm`;

      const prompt = `You are an SEO expert optimising eCommerce product listings using RankMath best practices.

You MUST strictly follow all formatting and instructions from the MEMORY section below. Instructions in double asterisks (like **THIS**) are non-negotiable rules. Do not skip, ignore, or reinterpret them.

MEMORY (RULES):
${memory}

PRODUCT DATA:
Name: ${productName}
Weight & Dimensions: ${dimensions}
Material: ${material}
Extra Info: ${extraInfo}

Generate the following:
- SEO-optimised Product Title
- Meta Description (~160 characters)
- 5-10 high-quality SEO tags seperated like this "1, 2, 3, 4, 5 and not listed under each other"
- Long Description of 200 words`;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: MODEL,
          prompt: prompt
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status}\n${errorText}`);
      }

      const data = await response.json();

      if (!data.choices || !data.choices.length) {
        throw new Error("No choices returned: " + JSON.stringify(data));
      }

      let seoOutput = data.choices[0].message.content;

      if (memory.includes("**DO NOT INCLUDE LONG DESCRIPTION**")) {
        seoOutput = stripSection(seoOutput, "Long Description");
      }

      if (memory.includes("**DO NOT INCLUDE TAGS**")) {
        seoOutput = stripSection(seoOutput, "SEO Tags");
      }

      setOutput(seoOutput);
    } catch (error) {
      setOutput("❌ Something went wrong:\n\n" + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "1rem", fontFamily: "sans-serif" }}>
      <h2>🌿 AI SEO Generator</h2>

      <label>Product Name:</label>
      <input value={productName} onChange={e => setProductName(e.target.value)} style={{ width: "100%" }} />

      <label>Weight (kg):</label>
      <input value={weight} onChange={e => setWeight(e.target.value)} style={{ width: "100%" }} />

      <label>Length (cm):</label>
      <input value={length} onChange={e => setLength(e.target.value)} style={{ width: "100%" }} />

      <label>Width (cm):</label>
      <input value={width} onChange={e => setWidth(e.target.value)} style={{ width: "100%" }} />

      <label>Height (cm):</label>
      <input value={height} onChange={e => setHeight(e.target.value)} style={{ width: "100%" }} />

      <label>Material:</label>
      <input value={material} onChange={e => setMaterial(e.target.value)} style={{ width: "100%" }} />

      <label>Extra Info:</label>
      <textarea
        value={extraInfo}
        onChange={e => setExtraInfo(e.target.value)}
        rows={5}
        style={{ width: "100%" }}
      />

      <button
        onClick={generateSEO}
        disabled={loading}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          background: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: loading ? "wait" : "pointer"
        }}
      >
        {loading ? "Generating..." : "Generate SEO"}
      </button>

      <h3 style={{ marginTop: "2rem" }}>SEO Output:</h3>
      <textarea
        value={output}
        readOnly
        rows={20}
        style={{ width: "100%", whiteSpace: "pre-wrap", fontFamily: "monospace" }}
      />
    </div>
  );
}

export default App;
