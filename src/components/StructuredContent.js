import React from 'react';
import './StructuredContent.css';

const StructuredContent = ({ content }) => {
  if (!content) return null;

  // More generic approach to detect headings and structure
  const blocks = content.split('\n\n').map(b => b.trim()).filter(b => b.length > 0);
  const elements = [];
  let i = 0;

  while (i < blocks.length) {
    const block = blocks[i];
    
    // Check if this looks like a heading (short line, often followed by content)
    const isHeading = (
      block.length < 100 && // Headings are typically shorter
      !block.includes('.') && // Headings typically don't end with periods
      !block.includes(',') && // Headings typically don't have commas
      block !== block.toLowerCase() && // Headings are typically capitalized
      (i === 0 || i < blocks.length - 1) // Not the last block or is the first block
    );
    
    if (isHeading) {
      elements.push({ type: 'h2', content: block });
      i++;
      continue;
    }
    
    // Check if this looks like a list item (starts with common list patterns)
    const isListItem = (
      block.match(/^[A-Z][^.]*:/) || // Pattern like "Something:"
      block.match(/^[A-Z][^.]*\.$/) && block.length < 200 // Short sentences ending with period
    );
    
    if (isListItem) {
      const listItems = [];
      while (i < blocks.length) {
        const currentBlock = blocks[i];
        const isCurrentListItem = (
          currentBlock.match(/^[A-Z][^.]*:/) ||
          (currentBlock.match(/^[A-Z][^.]*\.$/) && currentBlock.length < 200)
        );
        
        if (isCurrentListItem) {
          listItems.push(currentBlock);
          i++;
        } else {
          break;
        }
      }
      elements.push({ type: 'ul', items: listItems });
      continue;
    }
    
    elements.push({ type: 'p', content: block });
    i++;
  }

  return (
    <div className="structured-content">
      {elements.map((el, index) => {
        if (el.type === 'h2') {
          return <h2 key={index} dangerouslySetInnerHTML={{ __html: el.content }} />;
        }
        if (el.type === 'ul') {
          return (
            <ul key={index}>
              {el.items.map((item, itemIndex) => (
                <li key={itemIndex} dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          );
        }
        if (el.content) { // Ensure empty paragraphs are not rendered
          return <p key={index} dangerouslySetInnerHTML={{ __html: el.content }} />;
        }
        return null;
      })}
    </div>
  );
};

export default StructuredContent;
