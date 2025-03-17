<!-- src/components/PostDisplay.svelte -->
<script>
    export let title = '';
    export let content = '';
    export let author = '';
    export let date = '';

    // Convert date to formatted string
    let formattedDate = '';
    if (date) {
        try {
            formattedDate = new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch (e) {
            formattedDate = date;
        }
    }

    // Markdown renderer
    function renderMarkdown(text) {
        if (!text) return '';

        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2 class="text-2xl font-semibold mt-8 mb-3">$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1 class="text-3xl font-bold mt-10 mb-4">$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>');

        // Lists
        html = html.replace(/^\s*\n\* (.*)/gm, '<ul class="list-disc pl-6 my-4">\n<li>$1</li>');
        html = html.replace(/^\* (.*)/gm, '<li>$1</li>');
        html = html.replace(/^\s*\n\- (.*)/gm, '<ul class="list-disc pl-6 my-4">\n<li>$1</li>');
        html = html.replace(/^\- (.*)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\s*\n\s*<li>/g, '</li>\n<li>');
        html = html.replace(/<\/li>\s*\n\s*(?!<li>)/g, '</li>\n</ul>\n\n');

        // Code blocks
        html = html.replace(/```(.*?)```/gs, '<pre class="bg-gray-800 text-white p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm">$1</code>');

        // Blockquotes
        html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-4 border-indigo-200 pl-4 italic my-4">$1</blockquote>');

        // Horizontal rule
        html = html.replace(/^\-\-\-+/gim, '<hr class="my-6 border-t border-gray-300">');

        // Paragraphs
        html = html.replace(/^\s*(\n)?(.+)/gm, function (m) {
            return /\<(\/)?(h|ul|ol|li|blockquote|pre|hr|img|code)/.test(m) ? m : '<p class="my-4">' + m + '</p>';
        });

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');

        return html;
    }
</script>

<article class="bg-white shadow-md rounded-lg overflow-hidden">
    <div class="p-8">
        <h1 class="text-3xl font-bold mb-4">
            {title}
        </h1>

        {#if author || date}
            <div class="text-sm text-gray-500 mb-6">
                {#if author}
                    <span>By {author}</span>
                {/if}

                {#if author && date}
                    <span class="mx-2">•</span>
                {/if}

                {#if date}
                    <time>{formattedDate}</time>
                {/if}
            </div>
        {/if}

        <div class="prose prose-lg prose-indigo max-w-none">
            {@html renderMarkdown(content)}
        </div>
    </div>
</article>
