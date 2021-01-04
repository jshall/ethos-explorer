@preprocessor typescript

query -> _ or _          {% d => d[1] %}                # trim leading and trailing whitespace will be discarded

   or -> and _r:+        {% d => ['|',d[0],...d[1]] %}  # the OR operations are the last to be evaluated
       | and             {% id %}

   _r -> _ "|" _ and     {% d => d[3] %}                # the | or "pipe" character indicates an OR operaion

  and -> named _nd:+     {% d => ['&',d[0],...d[1]] %}  # the AND operation implied by whitespace is evaluted before OR
       | named           {% id %}

  _nd -> [\s]:+ named    {% d => d[1] %}                # all words separated by whitespace must be included in any order

named -> word ":" group  {% d => [d[0],d[2]] %}         # words or parenthized groups can be qualified with a name
       | group           {% id %}                       # that limits where the search terms will be applied

group -> "(" _ or _ ")"  {% d => d[2] %}                # areas wrapped in parenthesis will be evaluated first
       | word            {% id %}

 word -> [^\s"'|():]:+   {% d => d[0].join('') %}       # a "word" is a sequence of non-whitespace characters
       | ['] [^']:+ [']  {% d => d[1].join('') %}       # in additon to whitespace " ' | ( ) and : will be exluded unless
       | ["] [^"]:+ ["]  {% d => d[1].join('') %}       # singled or double quotes are used to include the reserved characters

    _ -> [\s]:*          {% id %}                       # the underscore is used in this grammar to indicate meaningless whitespace