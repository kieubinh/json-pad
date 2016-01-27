## Known issues/bugs ##

Bad HTML Sign at the end of a JSON string
I found out that Adobe Air and / or codemirror adding a &#8203;​ (more information about this at www.quirksmode.org) at the end of a codemirror input. This normally doesn't care but if you make a "Select All" (Strg+A) and a "Copy" (Strg+C) after you will copy the string with this html sign.

So this matters if you put the string into an textarea cause the browsers ignore that html sign inside an textarea, but they set the value after paste with the sign. This can occur an error in different ways.

For example: If you have a JSON string inside an database and changing it with an normal html textarea. Some JSON parsers can now give an error cause there is this html sign at the end of the string.
But, this sign is just in your clipboard if you press Strg+A for selection all inside CodeMirror. So you have some different ways without getting this error:

# Copy the string with the button inside JSONpad. How i said it just happens at selecting all..
# Select the string from the beginning to the end by yourself. But remember that you just select it to the last } or ].
# Turning off the Syntax Highlighting. This also turns off codemirror and you have a normal textarea.

Maybe i can fix it, but at the moment it is not blocking me at working with JSONpad.