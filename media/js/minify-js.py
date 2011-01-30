import os.path
import json
import urllib
import urllib2

def minify_js():
    OPEN_LOC = 'trunk/'
    OUTPUT_FILE = 'production/portrit-min.js'
    
    OPEN_FILES = ['easing.1.3.js',
				  'jquery.autocomplete.js',
				  'iscroll.js',
				  'mdetect.js',
				  'main.js',]
				  
    build_file = open(OUTPUT_FILE, 'w')
    src_lines = 0
    src_buffer = ""

    for file in OPEN_FILES:
        loc = OPEN_LOC + file
        current_line = src_lines
	
        with open(loc, 'r') as f:
            data = f.read()
		    
            src_buffer += data
            # build_file.write(data)
            # build_file.write('\n\n')
	
        with open(loc, 'r') as f:
            i = 0
            for i, l in enumerate(f):
                pass
            src_lines += i + 1
	
        print "Cating source file: " + file + " " + str(src_lines - current_line) + " lines"
    
    url = 'http://closure-compiler.appspot.com/compile'
    values = {'js_code' : src_buffer,
              'compilation_level' : 'SIMPLE_OPTIMIZATIONS',
              'output_format' : 'json',
              'output_info': 'compiled_code', }
    
    data = urllib.urlencode(values)
    req = urllib2.Request(url, data)
    response = urllib2.urlopen(req)
    data = response.read()
    
    data = json.loads(data)
    
    build_file.write(data['compiledCode'])
    build_file.close()
    
    print "Portrit JS Has Been Minified!"
    
if __name__ == '__main__':
    minify_js()