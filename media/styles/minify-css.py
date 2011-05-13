import os.path
import sys, re

def minify_css():
    OPEN_LOC = 'trunk/'
    OUTPUT_FILES = ['production/portrit.css',
                    'production/mobile.css']
    
    OPEN_FILES = ['portrit.css',
				  'mobile.css']
				  
    src_lines = 0
    src_buffer = ""
    file_count = 0

    for file in OPEN_FILES:
        build_file = open(OUTPUT_FILES[file_count], 'w')
        loc = OPEN_LOC + file
	
        with open(loc, 'r') as f:
            data = f.read()

            css = data

            # remove comments - this will break a lot of hacks :-P
            css = re.sub( r'\s*/\*\s*\*/', "$$HACK1$$", css ) # preserve IE<6 comment hack
            css = re.sub( r'/\*[\s\S]*?\*/', "", css )
            css = css.replace( "$$HACK1$$", '/**/' ) # preserve IE<6 comment hack

            # url() doesn't need quotes
            css = re.sub( r'url\((["\'])([^)]*)\1\)', r'url(\2)', css )

            # spaces may be safely collapsed as generated content will collapse them anyway
            css = re.sub( r'\s+', ' ', css )

            # shorten collapsable colors: #aabbcc to #abc
            css = re.sub( r'#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3(\s|;)', r'#\1\2\3\4', css )

            # fragment values can loose zeros
            css = re.sub( r':\s*0(\.\d+([cm]m|e[mx]|in|p[ctx]))\s*;', r':\1;', css )

            for rule in re.findall( r'([^{]+){([^}]*)}', css ):

                # we don't need spaces around operators
                selectors = [re.sub( r'(?<=[\[\(>+=])\s+|\s+(?=[=~^$*|>+\]\)])', r'', selector.strip() ) for selector in rule[0].split( ',' )]

                # order is important, but we still want to discard repetitions
                properties = {}
                porder = []
                for prop in re.findall( '(.*?):(.*?)(;|$)', rule[1] ):
                    key = prop[0].strip().lower()
                    if key not in porder: porder.append( key )
                    properties[ key ] = prop[1].strip()

                # output rule if it contains any declarations
                if properties:
                    build_file.write("%s{%s}" % ( ','.join( selectors ), ''.join(['%s:%s;' % (key, properties[key]) for key in porder])[:-1] ))
		    
        #             
        #   
        build_file.close()
        file_count += 1
    
    print "Portrit CSS Has Been Minified!"
    
if __name__ == '__main__':
    minify_css()