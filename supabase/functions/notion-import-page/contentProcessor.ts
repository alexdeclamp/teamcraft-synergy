
// Extract a suitable title from the page data
export function extractPageTitle(pageData: any, blocksData: any): string {
  let pageTitle = '';
  
  // 1. Try to get from standard properties.title
  if (pageData.properties && pageData.properties.title && 
      pageData.properties.title.title && 
      Array.isArray(pageData.properties.title.title) && 
      pageData.properties.title.title.length > 0) {
    
    pageTitle = pageData.properties.title.title
      .map((textObj: any) => textObj.plain_text)
      .join('');
  }
  // 2. If not found, try properties.Name which is also common
  else if (pageData.properties && pageData.properties.Name && 
           pageData.properties.Name.title && 
           Array.isArray(pageData.properties.Name.title) && 
           pageData.properties.Name.title.length > 0) {
           
    pageTitle = pageData.properties.Name.title
      .map((textObj: any) => textObj.plain_text)
      .join('');
  }
  // 3. If still not found, look for any property that has a title type
  else {
    for (const propKey in pageData.properties) {
      const prop = pageData.properties[propKey];
      if (prop.type === 'title' && prop.title && Array.isArray(prop.title) && prop.title.length > 0) {
        pageTitle = prop.title
          .map((textObj: any) => textObj.plain_text)
          .join('');
        break;
      }
    }
  }
  
  // 4. Fallback if we still couldn't find a title
  if (!pageTitle) {
    // Try to use the first heading or paragraph from content as a title
    for (const block of blocksData.results || []) {
      if (block.type === 'heading_1' && block.heading_1?.rich_text?.[0]?.plain_text) {
        pageTitle = block.heading_1.rich_text.map((t: any) => t.plain_text).join('');
        break;
      } 
      else if (block.type === 'paragraph' && block.paragraph?.rich_text?.[0]?.plain_text) {
        pageTitle = block.paragraph.rich_text.map((t: any) => t.plain_text).join('');
        if (pageTitle.length > 40) {
          pageTitle = pageTitle.substring(0, 40) + '...';
        }
        break;
      }
    }
    
    // Final fallback
    if (!pageTitle) {
      pageTitle = `Notion Page (${new Date().toLocaleDateString()})`;
    }
  }
  
  console.log(`Extracted page title: "${pageTitle}"`);
  return pageTitle;
}

// Process a single block
export async function processBlock(block: any, accessToken: string, level = 0): Promise<string> {
  const indent = '  '.repeat(level);
  
  switch (block.type) {
    case 'paragraph':
      if (block.paragraph.rich_text && block.paragraph.rich_text.length > 0) {
        return `${indent}${block.paragraph.rich_text.map((text: any) => text.plain_text).join('')}\n\n`;
      } else {
        return `${indent}\n\n`;
      }
    case 'heading_1':
      if (block.heading_1.rich_text && block.heading_1.rich_text.length > 0) {
        return `${indent}# ${block.heading_1.rich_text.map((text: any) => text.plain_text).join('')}\n\n`;
      }
      break;
    case 'heading_2':
      if (block.heading_2.rich_text && block.heading_2.rich_text.length > 0) {
        return `${indent}## ${block.heading_2.rich_text.map((text: any) => text.plain_text).join('')}\n\n`;
      }
      break;
    case 'heading_3':
      if (block.heading_3.rich_text && block.heading_3.rich_text.length > 0) {
        return `${indent}### ${block.heading_3.rich_text.map((text: any) => text.plain_text).join('')}\n\n`;
      }
      break;
    case 'bulleted_list_item':
      if (block.bulleted_list_item.rich_text && block.bulleted_list_item.rich_text.length > 0) {
        return `${indent}- ${block.bulleted_list_item.rich_text.map((text: any) => text.plain_text).join('')}\n`;
      }
      break;
    case 'numbered_list_item':
      if (block.numbered_list_item.rich_text && block.numbered_list_item.rich_text.length > 0) {
        return `${indent}1. ${block.numbered_list_item.rich_text.map((text: any) => text.plain_text).join('')}\n`;
      }
      break;
    case 'to_do':
      if (block.to_do.rich_text && block.to_do.rich_text.length > 0) {
        const checkbox = block.to_do.checked ? '[x]' : '[ ]';
        return `${indent}- ${checkbox} ${block.to_do.rich_text.map((text: any) => text.plain_text).join('')}\n`;
      }
      break;
    case 'toggle':
      if (block.toggle.rich_text && block.toggle.rich_text.length > 0) {
        return `${indent}**Toggle: ${block.toggle.rich_text.map((text: any) => text.plain_text).join('')}**\n\n`;
      }
      break;
    case 'child_page':
      return `${indent}**Child Page: ${block.child_page.title || 'Untitled'}**\n\n`;
    case 'quote':
      if (block.quote.rich_text && block.quote.rich_text.length > 0) {
        return `${indent}> ${block.quote.rich_text.map((text: any) => text.plain_text).join('')}\n\n`;
      }
      break;
    case 'code':
      if (block.code.rich_text && block.code.rich_text.length > 0) {
        return `${indent}\`\`\`${block.code.language || ''}\n${block.code.rich_text.map((text: any) => text.plain_text).join('')}\n\`\`\`\n\n`;
      }
      break;
    case 'divider':
      return `${indent}---\n\n`;
    case 'callout':
      if (block.callout.rich_text && block.callout.rich_text.length > 0) {
        const emoji = block.callout.icon?.emoji ? `${block.callout.icon.emoji} ` : '';
        return `${indent}> ${emoji}**Callout:** ${block.callout.rich_text.map((text: any) => text.plain_text).join('')}\n\n`;
      }
      break;
    case 'image':
      // Handle image blocks - extract the URL if possible
      let imageSource = '';
      let imageAlt = 'Image from Notion';
      
      // Check what type of image it is (external URL, file, etc.)
      if (block.image.type === 'external' && block.image.external?.url) {
        imageSource = block.image.external.url;
      } else if (block.image.type === 'file' && block.image.file?.url) {
        imageSource = block.image.file.url;
      }
      
      // Check if there's a caption to use as alt text
      if (block.image.caption && block.image.caption.length > 0) {
        imageAlt = block.image.caption.map((cap: any) => cap.plain_text).join('');
      }
      
      if (imageSource) {
        // Return markdown image format
        return `${indent}![${imageAlt}](${imageSource})\n\n`;
      } else {
        // If we can't get the image URL, provide a nicer message
        return `${indent}*[Image from Notion - not imported]*\n\n`;
      }
    case 'table':
      return `${indent}[Table content not fully supported]\n\n`;
    case 'column_list':
      return `${indent}[Column layout not fully supported]\n\n`;
    default:
      return `${indent}[${block.type} block type not supported]\n\n`;
  }
  
  return '';
}

// Process blocks recursively, including nested blocks
export async function processBlocksRecursively(blocks: any[], accessToken: string, level = 0): Promise<string> {
  let blockContent = '';
  
  for (const block of blocks) {
    // Process the current block based on its type
    blockContent += await processBlock(block, accessToken, level);
    
    // Check if the block has children
    if (block.has_children) {
      try {
        // Import the function to fetch child blocks
        const { fetchChildBlocks } = await import('./notionApi.ts');
        
        // Fetch the children blocks
        const childrenData = await fetchChildBlocks(block.id, accessToken);
        
        // Process the children blocks with an increased level
        blockContent += await processBlocksRecursively(childrenData.results, accessToken, level + 1);
      } catch (err) {
        console.error(`Error fetching children for block ${block.id}:`, err);
        blockContent += `\n\n*[Error loading nested content]*\n\n`;
      }
    }
  }
  
  return blockContent;
}
