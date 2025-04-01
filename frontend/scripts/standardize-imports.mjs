import ts from 'typescript';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Configuration ---
const projectRoot = path.resolve(__dirname, '..'); // Assumes script is in frontend/scripts
const srcDir = path.join(projectRoot, 'src');
const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
const dryRun = false; // Set to true to only log changes without writing files
// --- End Configuration ---

async function loadTsConfig() {
    try {
        const configFileText = await fs.readFile(tsconfigPath, 'utf8');
        const result = ts.parseConfigFileTextToJson(tsconfigPath, configFileText);
        if (result.error) {
            throw new Error(`Error parsing tsconfig.json: ${result.error.messageText}`);
        }
        const configObject = result.config;
        // Ensure compilerOptions and paths exist
        if (!configObject.compilerOptions || !configObject.compilerOptions.paths || !configObject.compilerOptions.baseUrl) {
             throw new Error('tsconfig.json must contain compilerOptions with baseUrl and paths');
        }
        return configObject.compilerOptions; // Return raw compilerOptions
    } catch (error) {
        console.error(`Failed to load or parse tsconfig.json at ${tsconfigPath}:`, error);
        throw error;
    }
}

async function findSourceFiles(dir) {
    let files = [];
    try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                // Avoid node_modules and potentially other build/dist folders if they exist under src
                if (entry.name !== 'node_modules' && entry.name !== 'dist' && entry.name !== 'build') {
                    files = files.concat(await findSourceFiles(fullPath));
                }
            } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
                files.push(fullPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
        // Decide if you want to stop or continue
    }
    return files;
}

function getAliasForPath(absoluteImportPath, absoluteBaseUrl, paths) {
    const relativePathFromBase = path.relative(absoluteBaseUrl, absoluteImportPath).replace(/\\/g, '/');
    // Remove .ts / .tsx extension for matching
    const relativePathWithoutExtension = relativePathFromBase.replace(/\.(ts|tsx)$/, '');

    let bestMatchAlias = null;
    let longestMatchPrefixLength = -1;

    for (const alias in paths) {
        const aliasPathPatterns = paths[alias];
        for (const pattern of aliasPathPatterns) {
            const aliasPrefix = alias.replace(/\/\*$/, ''); // Remove trailing /*
            const patternPrefix = pattern.replace(/\/\*$/, ''); // Remove trailing /*

            if (relativePathWithoutExtension.startsWith(patternPrefix)) {
                 // Check if this match is more specific (longer prefix)
                 if (patternPrefix.length > longestMatchPrefixLength) {
                    longestMatchPrefixLength = patternPrefix.length;
                    const remainingPath = relativePathWithoutExtension.substring(patternPrefix.length);
                    // Ensure remaining path starts with / or is empty if prefix wasn't empty
                    if (patternPrefix === '' || remainingPath.startsWith('/') || remainingPath === '') {
                         bestMatchAlias = aliasPrefix + (remainingPath.startsWith('/') ? remainingPath : '/' + remainingPath);
                         // Remove trailing slash if it exists and the alias wasn't just "@/"
                         if (bestMatchAlias.endsWith('/') && bestMatchAlias.length > 1 && aliasPrefix !== '@') {
                            bestMatchAlias = bestMatchAlias.slice(0, -1);
                         }
                    }
                 }
            }
        }
    }
    return bestMatchAlias;
}


async function processFile(filePath, compilerOptions) {
    const { baseUrl, paths } = compilerOptions;
    const absoluteBaseUrl = path.resolve(projectRoot, baseUrl);
    let originalContent;
    let currentContent;

    try {
        originalContent = await fs.readFile(filePath, 'utf8');
        currentContent = originalContent; // Start with original content
        let changesMadeInFile = false;
        let lastNodeEnd = 0; // Track end of last processed node to avoid overlapping replacements
        let accumulatedOffset = 0; // Track offset changes due to replacements

        const sourceFile = ts.createSourceFile(
            path.basename(filePath),
            originalContent,
            ts.ScriptTarget.ESNext,
            true
        );

        const visitor = (node) => {
            if (ts.isImportDeclaration(node) && node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
                const importPath = node.moduleSpecifier.text;

                if (importPath.startsWith('.')) {
                    const currentDir = path.dirname(filePath);
                    let absoluteImportPath = path.resolve(currentDir, importPath);

                    // Attempt to find alias
                    const alias = getAliasForPath(absoluteImportPath, absoluteBaseUrl, paths);

                    if (alias && alias !== importPath) {
                        const newNodeText = `import ${sourceFile.text.substring(node.importClause?.getStart(sourceFile) ?? node.getStart(sourceFile) + 6, node.importClause?.getEnd() ?? node.getStart(sourceFile) + 6)} from '${alias}';`;

                        const nodeStart = node.getStart(sourceFile) + accumulatedOffset;
                        const nodeEnd = node.getEnd() + accumulatedOffset;

                        // Ensure we don't process overlapping nodes incorrectly
                        if (nodeStart >= lastNodeEnd) {
                            currentContent = currentContent.substring(0, nodeStart) + newNodeText + currentContent.substring(nodeEnd);
                            accumulatedOffset += newNodeText.length - (nodeEnd - nodeStart);
                            lastNodeEnd = nodeStart + newNodeText.length;
                            changesMadeInFile = true;
                        } else {
                             console.warn(`Skipping overlapping node replacement in ${path.relative(projectRoot, filePath)} for import: ${importPath}`);
                        }
                    }
                }
            }
            ts.forEachChild(node, visitor);
        };

        visitor(sourceFile);

        if (changesMadeInFile) {
            console.log(`Standardizing imports in: ${path.relative(projectRoot, filePath)}`);
            if (!dryRun) {
                await fs.writeFile(filePath, currentContent, 'utf8');
            } else {
                 console.log(`--- DRY RUN: Changes for ${path.relative(projectRoot, filePath)} ---`);
                 // Basic diff logging (can be improved)
                 console.log("Original Imports (approximated):");
                 originalContent.split('\n').filter(line => line.trim().startsWith('import ') && (line.includes(' from ".') || line.includes(' from "..'))).forEach(line => console.log(line));
                 console.log("\nNew Imports (approximated):");
                 currentContent.split('\n').filter(line => line.trim().startsWith('import ') && line.includes(' from "@')).forEach(line => console.log(line));
                 console.log("--- END DRY RUN ---");
            }
        }
    } catch (error) {
        console.error(`Error processing file ${filePath}:`, error);
    }
}


async function run() {
    console.log(`Starting import standardization${dryRun ? ' (DRY RUN)' : ''}...`);
    const compilerOptions = await loadTsConfig();
    if (!compilerOptions) {
        console.error("Could not load compiler options. Aborting.");
        return;
    }
    const files = await findSourceFiles(srcDir);
    console.log(`Found ${files.length} source files to process.`);

    // Process files sequentially
    for (const file of files) {
        await processFile(file, compilerOptions);
    }

    console.log("Import standardization complete.");
}

run().catch(console.error);
