<!-- src/components/PostEditor.svelte -->
<script>
    export let postId = null;
    export let initialTitle = '';
    export let initialContent = '';
    export let initialPublished = false;
    export let submitUrl = '/api/posts/create';

    let title = initialTitle;
    let content = initialContent;
    let published = initialPublished;
    let previewMode = false;

    // Simple markdown renderer for preview
    function renderMarkdown(text) {
        if (!text) return '';

        let html = text;

        // Headers
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Bold and italic
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-indigo-600 hover:underline">$1</a>');

        // Lists
        html = html.replace(/^\s*\n\* (.*)/gm, '<ul>\n<li>$1</li>');
        html = html.replace(/^\* (.*)/gm, '<li>$1</li>');
        html = html.replace(/^\s*\n\- (.*)/gm, '<ul>\n<li>$1</li>');
        html = html.replace(/^\- (.*)/gm, '<li>$1</li>');
        html = html.replace(/<\/li>\s*\n\s*<li>/g, '</li>\n<li>');
        html = html.replace(/<\/li>\s*\n\s*(?!<li>)/g, '</li>\n</ul>\n\n');

        // Code blocks
        html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');

        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Paragraphs
        html = html.replace(/^\s*(\n)?(.+)/gm, function (m) {
            return /\<(\/)?(h|ul|ol|li|blockquote|pre|img|code)/.test(m) ? m : '<p>' + m + '</p>';
        });

        // Clean up empty paragraphs
        html = html.replace(/<p><\/p>/g, '');

        return html;
    }

    function togglePreview() {
        previewMode = !previewMode;
    }
</script>

<div class="bg-white shadow-md rounded-lg p-6">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-xl font-bold">{postId ? 'Edit Post' : 'Create New Post'}</h2>
        <button type="button" class="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-3 rounded" on:click={togglePreview}>
            {previewMode ? 'Edit' : 'Preview'}
        </button>
    </div>

    {#if !previewMode}
        <form method="POST" action={submitUrl} class="space-y-6">
            <div>
                <label for="title" class="block text-sm font-medium text-gray-700 mb-1"> Post Title </label>
                <input type="text" id="title" name="title" bind:value={title} required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div>
                <label for="content" class="block text-sm font-medium text-gray-700 mb-1"> Content </label>
                <textarea id="content" name="content" bind:value={content} rows="12" required class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"></textarea>
                <p class="mt-1 text-sm text-gray-500">You can use Markdown for formatting.</p>
            </div>

            <div class="flex items-center">
                <input type="checkbox" id="published" name="published" value="1" bind:checked={published} class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                <label for="published" class="ml-2 block text-sm text-gray-700"> Publish immediately </label>
            </div>

            <div class="flex justify-end space-x-3">
                <a href="/dashboard" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"> Cancel </a>
                <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {postId ? 'Update Post' : 'Save Post'}
                </button>
            </div>
        </form>
    {:else}
        <div class="mb-6">
            <h1 class="text-3xl font-bold mb-4">{title || 'Untitled Post'}</h1>
            <div class="prose prose-indigo max-w-none">
                {@html renderMarkdown(content)}
            </div>
        </div>
        <div class="flex justify-end">
            <button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" on:click={togglePreview}> Return to Editor </button>
        </div>
    {/if}
</div>
