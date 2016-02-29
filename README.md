# re-path

Utility to assit with maintaining nested project dependencies.

Provides a cli tool and programmatic API.

Given a working directory this utility will match files via a glob expression.  Matching files will be parsed, and internal paths will be resolved. If a path is not resolved, the cli will prompt for a new matching path and the file will be rewritten.  Non resolved paths can be memoised with a matching path and files can be automatically rewritten.

### Cli options:
`'-c, --cwd [value]', 'Current working directory.'`

`'-g, --glob [value]', 'Glob on which to match on, see npm glob'`

`'-am, --autoMemoise', 'Automatically replace with matching memoised paths.'`

`'-t, --threshold <n>', 'If autoMemoised enabled, threshold in which to match.'`

Memoised matches are computed by evaluating number of correct matching subdirectories starting will file and traversing toward the root. 
E.g. given '../moduleB/moduleB' with memoised path '/User/andrsnn/re-path/moduleB/moduleB' will produce a match of 2.

### Current caveats:
* Assumes module dependencies are placed on new lines.
* Currently only supports unix based operating system pathing.

See https://www.npmjs.com/package/glob and https://www.npmjs.com/package/minimatch for more on pattern matching.



