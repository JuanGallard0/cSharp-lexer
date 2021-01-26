// Global
var ht;
var countLines;

// Settings
var form = document.getElementById("searchForm");
function handleForm(event) { event.preventDefault(); } 
form.addEventListener('submit', handleForm);

// C# Regular Expresions
const er_comment = /\/\/.*/;
const er_identifier = /([a-z]|[A-Z]|\_)([a-z]|[A-Z]|\d|\_)*/;
const er_keyword = /(int)|(bool)|(char)|(string)|(if)|(else)|(while)|(for)|(public)|(return)/; 
const er_operator = /\+\+|\+|\-\>|\-\-|\-|\*|\/|\%|\&\&|\|\||\>\=|\<\=|\=\=|\=|\!|\!\=|\<|\>|(true)|(false)/;
const er_number = /\d+(\.\d+)?/;
const er_char = /\'.\'/;
const er_string = /\".*\"/;
const er_leftParen = /\(/;
const er_rightParen = /\)/;
const er_startBlock = /\{/;
const er_endBlock = /\}/;
const er_endInstruc = /\;/;
const er_swipe = /^\ø+$|^$/;

// Tokenizer
function Tokenize() {
	// Get source code
	let sourceCode = document.getElementById("sourceCode").value;
	let output = "";
	let outputArea = document.getElementById("outputArea");
	
	// Split lines 
	let lineArray = sourceCode.split(/\r|\n/);
	let tokenArray = [];
	let match;
	countLines = 0;

	// New symbol table
	ht = new HashTable();

	// Analize each line
	for (let line of lineArray) {
		tokenArray = [];
		countLines++;
		line = line.replace(/\s/g, 'ø');

		// Swipe 
		match = er_swipe.exec(line);
		if (match) 
			continue;
		// Comments
		match = er_comment.exec(line);
		if (match) 
			continue;
		// Keywords
		line = RegExMatch(er_keyword, line, tokenArray, "Keyword");
		// Operators
		line = RegExMatch(er_operator, line, tokenArray, "Operator");
		// Char
		line = RegExMatch(er_char, line, tokenArray, "Character");
		// String
		line = RegExMatch(er_string, line, tokenArray, "String");
		// Number 
		line = RegExMatch(er_number, line, tokenArray, "Number");
		// Identifier
		line = RegExMatch(er_identifier, line, tokenArray, "Identifier");
		// Left paren
		line = RegExMatch(er_leftParen, line, tokenArray, "Left_Parenthesis");
		// Right paren
		line = RegExMatch(er_rightParen, line, tokenArray, "Right_Parenthesis");
		// Start Block
		line = RegExMatch(er_startBlock, line, tokenArray, "Start_Block");
		// End Block
		line = RegExMatch(er_endBlock, line, tokenArray, "EndOf_Block");
		// End Instruction
		line = RegExMatch(er_endInstruc, line, tokenArray, "EndOf_Instruction");

		// Output
		output = output.concat('-'.repeat(40), "Line ", `${countLines}`);
		output = output.concat("\n");
		for (index in tokenArray) {
			if (index) {
				let temp = tokenArray[index].split('\t');
				output = output.concat(temp[0], '\t', temp[1], '\n');

				// Add to symbol table
				ht.add(`${temp[0]}`, {symbol: temp[0], line: `\t${countLines}[${temp[2]}]`, class: temp[1]});
			}
		}
	}

	outputArea.value = output;
}

// Create tokens
function RegExMatch(regEx, line, tokenArray, name) {
	let	match = regEx.exec(line);
	while(match) {
		tokenArray[match.index] = `${match[0]}	${name}	${match.index}`;
		line = line.replace(match[0], 'ø'.repeat(match[0].length));
		
		match = regEx.exec(line);
	}
	return line;
}

// Display search results
function searchTable() {
	let searchArea = document.getElementById("searchArea");
	let key = document.getElementById("searchInput").value;

	let searchResult = ht.search(key);
	searchResult = searchResult;

	if (searchResult != undefined) {
		searchArea.value = `SYMBOL: ${searchResult.symbol}\nCLASS: 	${searchResult.class}\nLINE:${searchResult.line}`;
	}
	else {
		searchArea.value = "No matching results."
	}
}

// Symbol table (hash implementation)
class HashTable {
	constructor() {
		this.values = {};
		this.length =  0;
		this.size =  0;

	}

	// Hash function
	calculateHash(key) {
		return key.toString() % this.size;
	}

	// Add symbol
	add(key, value) {
		const hash = this.calculateHash(key);
		if (!this.values.hasOwnProperty(hash)) {
			this.values[hash] = {};
		}
		if (!this.values[hash].hasOwnProperty(key)) {
			this.length++;
			this.values[hash][key] = value;
		}
		else {
			this.values[hash][key].line = this.values[hash][key].line.concat(`\n${value.line}`);
		}
	}

	// Search symbol
	search(key) {
		const hash = this.calculateHash(key);
		if (this.values.hasOwnProperty(hash) && this.values[hash].hasOwnProperty(key)) {
			return this.values[hash][key];
		} else {
			return null;
		}
	}
}