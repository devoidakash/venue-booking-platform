import os
import shlex
import re
import sys

# Configuration
OUTPUT_FILE = "project_context.md"

def generate_markdown():
   print("---------------------------------------------------------")
   print("DRAG & DROP MODE")
   print("Drag your files here and press ENTER.")
   print("---------------------------------------------------------")
  
   # Get raw input
   try:
       user_input = input("> ").strip()
   except EOFError:
       return

   if not user_input:
       print("No files provided.")
       return

   # --- THE FIX ---
   # Use Regex to find any closing quote followed immediately by an opening quote
   # and insert a space between them.
   # Handles 'path1''path2' -> 'path1' 'path2'
   sanitized_input = re.sub(r"(?<=['\"])(?=['\"])", " ", user_input)

   # Now split correctly
   try:
       file_paths = shlex.split(sanitized_input)
   except ValueError:
       file_paths = sanitized_input.split()

   # Create the file
   with open(OUTPUT_FILE, 'w', encoding='utf-8') as outfile:
       print(f"\nProcessing {len(file_paths)} files...\n")
      
       files_processed = 0
      
       for path in file_paths:
           clean_path = path.strip('"').strip("'")
          
           # Skip if it's an empty string resulting from a bad split
           if not clean_path:
               continue

           if os.path.exists(clean_path) and os.path.isfile(clean_path):
               try:
                   ext = os.path.splitext(clean_path)[1]
                  
                   # Read content
                   with open(clean_path, 'r', encoding='utf-8') as infile:
                       content = infile.read()

                   # Write to Markdown
                   # Use relative path for the header if possible, else absolute
                   try:
                       display_path = os.path.relpath(clean_path, os.getcwd())
                   except ValueError:
                       display_path = clean_path

                   outfile.write(f"## File: {display_path}\n")
                   outfile.write(f"```{ext[1:] if ext else ''}\n")
                   outfile.write(content)
                   outfile.write("\n```\n\n")
                   outfile.write("---\n\n")
                  
                   print(f"✔ Added: {display_path}")
                   files_processed += 1

               except Exception as e:
                   print(f"❌ Error reading {clean_path}: {e}")
           else:
               print(f"⚠ Not Found: {clean_path}")

   print(f"\nDone! {files_processed} files saved to {OUTPUT_FILE}")
  
   # --- AUTO OPEN ---
   if files_processed > 0:
       print("Opening in VS Code...")
       os.system(f"code {OUTPUT_FILE}")

if __name__ == "__main__":
   generate_markdown()
