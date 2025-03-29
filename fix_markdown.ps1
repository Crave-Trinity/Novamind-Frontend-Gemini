$filePath = "c:\Users\JJ\Desktop\NOVAMIND-DIGITALTWIN\frontend\docs\HIPAA_FRONTEND_COMPLIANCE.md"
$content = Get-Content $filePath -Raw

# Fix headings (ensure blank line after headings)
$content = $content -replace '(^|\n)(#{1,6} [^\n]+)(\n)(?!\n)', '$1$2$3$3'

# Fix code blocks (ensure blank lines around fenced code blocks)
$content = $content -replace '(\n)```([^\n]+)', '$1$1```$2'
$content = $content -replace '```(\n)(?!\n)', '```$1$1'

# Fix lists (ensure blank lines around lists)
$content = $content -replace '(\n)(\d+\. [^\n]+)(\n)(?!\n)(?=\d+\. )', '$1$1$2$3'
$content = $content -replace '(\n)(- [^\n]+)(\n)(?!\n)(?=- )', '$1$1$2$3'

# Ensure single trailing newline
if (-not $content.EndsWith("`n")) {
    $content += "`n"
} 
while ($content.EndsWith("`n`n")) {
    $content = $content.Substring(0, $content.Length - 1)
}

# Write back to file
$content | Set-Content $filePath -NoNewline
Write-Host "Markdown linting fixes applied to $filePath"
