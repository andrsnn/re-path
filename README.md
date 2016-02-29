# re-path

Utility to assit with maintaining nested project dependencies.

Install cli globally via `npm install -g https://github.com/andrsnn/re-path` and use via `re-path -cwd ~/git`.

Install module `npm install --save https://github.com/andrsnn/re-path`.

Provides a cli tool and programmatic API.

Given a working directory this utility will match files via a glob expression.  Matching files will be parsed, and internal paths will be resolved. If a path is not resolved to a matching file, the cli will prompt for a new matching path and the file will be rewritten.  Non resolved paths can be memoised with a matching path and files can be automatically rewritten.

### Cli options:
`'-c, --cwd [value]', 'Current working directory.'`

`'-g, --glob [value]', 'Glob on which to match on, see npm glob'`

`'-a, --auto', 'Automatically replace with matching memoised paths.'`

`'-t, --threshold <n>', 'Threshold in which to match. Defaults to 1.'`

Memoised matches are computed by evaluating number of correct matching subdirectories starting will file and traversing toward the root. 
E.g. given `'../moduleB/moduleB'` with memoised path `'/User/andrsnn/re-path/moduleB/moduleB'` will produce a match of 2.  Given a threshold greater than 2 will mean module path will not be automatically rewritten, and a new path will be prompted for.

tests/template-project is used as a example project directory with unresolved paths. Running `npm test` currently will produce a copy of this directory.

### Current caveats:
* Assumes module dependencies are placed on new lines.
* Currently only supports unix based operating system pathing.

### To do:
* Needs tests.

See https://www.npmjs.com/package/glob and https://www.npmjs.com/package/minimatch for more on pattern matching.



