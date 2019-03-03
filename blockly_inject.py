#!/usr/bin/env python

SOURCE = 'index_resizable.html'
DESTINATION_TEMPLATE = 'index_template.html'
DESTINATION = 'index.html'

BLOCKLY_AREA = '>blocklyArea'
GENERATOR_AREA = '>generatorArea'
BUTTONS_AREA = 'buttonsArea'

BLOCKLY_AREA_HEIGHT = '500px'   # blockly needs an absolute height specification to show up in page
GENERATOR_AREA_HEIGHT = '100%'

def inject():
    """Inject blockly code from my own template into the mobirise index.html"""
    
    blocklyArea   = ' style="height: ' + BLOCKLY_AREA_HEIGHT + '"><div id="blocklyArea" style="height: 95%"></div>'
    generatorArea = ' style="height: ' + GENERATOR_AREA_HEIGHT + '"><div id="generatorArea">' \
                    '<pre style="font-size: 80%"><code id="generatorCode"></code></pre></div>'
    buttonsArea   = '<p><button onclick="saveWorkspaceEvent()">Save workspace by clicking here!</button>&nbsp;<input type="text" id="filename" value="workspace.txt"></p>\r\n' \
                    '<p><button onclick="loadWorkspaceEvent(loadWorkspace)">Load workspace by clicking here!</button></p>\r\n'
    blocklyDiv    = '<div id="blocklyDiv" style="position: absolute"></div>\r\n'

    scripts_head = ''
    xml_body = ''
    scripts_body = ''
        
    with open(SOURCE, 'r') as f:
        toolbox = None
        startBlocks = None
        scriptsBody = False
    
        # extract all <script> and <xml> tags from <head> and <body>
        for line in f:
            if scripts_body == '':
                if xml_body == '':
                    if scripts_head == '':
                        if line.find('<head>') >= 0:
                            scripts_head = '\r\n'
                    else:
                        if line.find('<script') >= 0:
                            scripts_head += line
                        elif line.find('</head>') >= 0:
                            xml_body = '\r\n'
                else: 
                    if toolbox == None:
                        if line.find('<xml xmlns="http://www.w3.org/1999/xhtml" id="toolbox"') >= 0:
                            toolbox = False
                            xml_body += line                    
                    elif toolbox == False:
                        xml_body += line
                        if line.find('</xml>') >= 0:
                            toolbox = True
                            xml_body += '\r\n'                            
                            
                    if startBlocks == None:
                        if line.find('<xml xmlns="http://www.w3.org/1999/xhtml" id="startBlocks"') >= 0:
                            startBlocks = False
                            xml_body += line                        
                    elif startBlocks == False:
                        xml_body += line
                        if line.find('</xml>') >= 0:
                            startBlocks = True
                            xml_body += '\r\n'                                                        
                        
                    if toolbox and startBlocks: 
                        scripts_body = '\r\n'                            
            else:
                if scriptsBody:
                    scripts_body += line
                    if line.find('</script>') >= 0:
                        scripts_body += '\r\n'
                        break   # done parsing
                else:
                    if line.find('<script>') >= 0:
                        scriptsBody = True
                        scripts_body += line

        #print("Scripts head: ", scripts_head)
        #print("XML body: ", xml_body)
        #print("Scripts body: ", scripts_body)

    template = open(DESTINATION_TEMPLATE, 'r')
    destination = open(DESTINATION, 'wt')
    
    in_body = False
    
    for line in template:
        if in_body:
            if line.find(BLOCKLY_AREA) >= 0:
                line = line.replace(BLOCKLY_AREA, blocklyArea)
            elif line.find(GENERATOR_AREA) >= 0:
                line = line.replace(GENERATOR_AREA, generatorArea)
            elif line.find(BUTTONS_AREA) >= 0:
                line = line.replace(BUTTONS_AREA, buttonsArea)
            if line.find('</body>') >= 0:
                destination.write(blocklyDiv)
                destination.write(xml_body)
                destination.write(scripts_body)        
        else:
            if line.find('</head>') >= 0:
                destination.write(scripts_head)
            elif line.find('<body>') >= 0:
                in_body = True

        destination.write(line)
     
    template.close()
    destination.close()
     
    print('Done')
        
inject()