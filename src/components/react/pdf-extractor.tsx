import React, { useState } from "react";

export default function PDFLinkExtractor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const extractPDFLinks = () => {
    setError("");
    setSuccess("");

    if (!input.trim()) {
      setError("Please paste some HTML content");
      return;
    }

    try {
      // Create a temporary DOM element to parse HTML
      const parser = new DOMParser();
      const doc = parser.parseFromString(input, "text/html");

      // Find all links (a tags and other elements with href/src)
      const links: string[] = [];

      // Get all anchor tags
      const anchors = doc.querySelectorAll("a[href]");
      anchors.forEach((a) => {
        const href = a.getAttribute("href");
        if (href && href.toLowerCase().endsWith(".pdf")) {
          links.push(href);
        }
      });

      // Get all iframes (sometimes PDFs are embedded)
      const iframes = doc.querySelectorAll("iframe[src]");
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute("src");
        if (src && src.toLowerCase().includes(".pdf")) {
          links.push(src);
        }
      });

      // Get all embed tags
      const embeds = doc.querySelectorAll("embed[src]");
      embeds.forEach((embed) => {
        const src = embed.getAttribute("src");
        if (src && src.toLowerCase().endsWith(".pdf")) {
          links.push(src);
        }
      });

      // Get all object tags
      const objects = doc.querySelectorAll("object[data]");
      objects.forEach((obj) => {
        const data = obj.getAttribute("data");
        if (data && data.toLowerCase().endsWith(".pdf")) {
          links.push(data);
        }
      });

      if (links.length === 0) {
        setError("No PDF links found in the HTML");
        setOutput("");
        return;
      }

      const json = JSON.stringify(links, null, 2);
      setOutput(json);
      setSuccess(
        `✓ Found ${links.length} PDF link${links.length !== 1 ? "s" : ""}!`
      );

      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError(
        "Error parsing HTML: " +
          (e instanceof Error ? e.message : "Unknown error")
      );
      setOutput("");
    }
  };

  const clearAll = () => {
    setInput("");
    setOutput("");
    setError("");
    setSuccess("");
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output).then(() => {
      setSuccess("✓ Copied to clipboard!");
      setTimeout(() => setSuccess(""), 3000);
    });
  };

  const saveAsCSV = () => {
    try {
      const links = JSON.parse(output);

      // Create CSV content with header
      let csvContent = "PDF Link\n";
      links.forEach((link: string) => {
        // Escape quotes in the link and wrap in quotes
        const escapedLink = `"${link.replace(/"/g, '""')}"`;
        csvContent += escapedLink + "\n";
      });

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pdf-links-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      setSuccess("✓ CSV file downloaded!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (e) {
      setError("Error creating CSV file");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            🔄 PDF Link Extractor
          </h1>
          <p className="text-purple-100 text-lg">
            Paste your HTML and get all the PDF links in JSON
          </p>
        </div>

        {/* Content */}
        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Input Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Input (HTML)
              </h2>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  extractPDFLinks();
                }
              }}
              placeholder={`Paste your HTML here...

Example:
<a href="document.pdf">Download PDF</a>
<a href="https://example.com/report.pdf">Report</a>
<iframe src="embed.pdf"></iframe>`}
              className="w-full h-96 p-4 border-2 border-gray-300 rounded-lg font-mono text-sm resize-y focus:outline-none focus:border-purple-500 transition-colors"
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Output Panel */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Output (JSON)
              </h2>
              {output && (
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-semibold text-sm"
                >
                  📋 Copy
                </button>
              )}
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="JSON output will appear here..."
              className="w-full h-96 p-4 bg-slate-900 text-slate-100 rounded-lg font-mono text-sm resize-y border-none"
            />
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg text-sm text-center font-semibold">
                {success}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center p-6 pt-0">
          <button
            onClick={extractPDFLinks}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Extract PDF Links
          </button>
          <button
            onClick={clearAll}
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={saveAsCSV}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-800 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            Download as CSV
          </button>
        </div>

        {/* Info */}
        <div className="bg-purple-50 border-t border-purple-100 p-4 text-center text-sm text-gray-600">
          💡 Tip: Press{" "}
          <kbd className="px-2 py-1 bg-white rounded border">
            Ctrl/Cmd + Enter
          </kbd>{" "}
          to extract quickly
        </div>
      </div>
    </div>
  );
}
