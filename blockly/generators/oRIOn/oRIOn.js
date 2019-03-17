'use strict';

const pin_functions = ['DIGITAL_IN', 'DIGITAL_OUT', 'ANALOG_IN', 'ANALOG_OUT'];

// map of transformer types, each type is associated with:
//  [second input?, text for input 0, text for input 1, state space requirements (#floats), config space requirements (#floats)]
var transformer_map = new Map([['OPTION_NEG', [false, '', '', '&transformerNegate', 0, 0]],
                               ['OPTION_ADD', [true, '', 'to', '&transformerAdd', 0, 0]],
                               ['OPTION_SUB', [true, '', 'from', '&transformerSubtract', 0, 0]],
                               ['OPTION_MUL', [true, '', 'by', '&transformerMultiply', 0, 0]],
                               ['OPTION_DIV', [true, '', 'by', '&transformerDivide', 0, 0]],
                               ['OPTION_LPF', [false, '', '', '&transformerLowPassFilter', 0, 1]],
                               ['OPTION_INTEGRATE', [false, '', '', '&transformerIntegrate', 0, 0]],
                               ['OPTION_DERIVE', [false, '', '', '&transformerDerive', 0, 0]],
                               ['OPTION_PID', [false, '', '', '&transformerPID', 1, 3]],
                               ['OPTION_INVSQRT', [false, '', '', '&transformerInvSqrt', 0, 0]],
                               ['OPTION_SQRT', [false, '', '', '&transformerSqrt', 0, 0]],
                               ['OPTION_TAN', [false, '', '', '&transformerTan', 0, 0]],
                               ['OPTION_COT', [false, '', '', '&transformerCot', 0, 0]],
                               ['OPTION_FASTEXP', [false, '', '', '&transformerFastExp', 0, 0]],
                               ['OPTION_POW2', [false, '', '', '&transformerPow2', 0, 0]],
                               ['OPTION_EXP', [false, '', '', '&transformerExp', 0, 0]],
                               ['OPTION_LOG2', [false, '', '', '&transformerLog2', 0, 0]],
                               ['OPTION_LN', [false, '', '', '&transformerLn', 0, 0]],
                               ['OPTION_LOG', [false, '', '', '&transformerLog', 0, 0]],
                               ['OPTION_ATAN', [false, '', '', '&transformerAtan', 0, 0]],
                               ['OPTION_ATAN2', [true, 'x', 'y', '&transformerAtan2', 0, 0]],
                               ['OPTION_SIN', [false, '', '', '&transformerSin', 0, 0]],
                               ['OPTION_COS', [false, '', '', '&transformerCos', 0, 0]],
                               ['OPTION_LIM', [false, '', '', '&transformerLimit', 0, 2]],
                               ['OPTION_ABS', [false, '', '', '&transformerAbs', 0, 0]],
                               ['OPTION_CEIL', [false, '', '', '&transformerCeil', 0, 0]],
                               ['OPTION_FLOOR', [false, '', '', '&transformerFloor', 0, 0]],
                               ['OPTION_MOD', [true, '', 'by', '&transformerMod', 0, 0]]
                               ]);

// map of counter types, each type is associated with:
//  [number of config inputs, text for input 0, text for input 1, control parameter]                    
var counter_map = new Map([['OPTION_FREE_RUNNING', [0, '', '', 'ORION_COUNTER_FREE_RUNNING']],
                           ['OPTION_PERIODIC', [1, '- period [ms]', '', 'ORION_COUNTER_PERIODIC']],
                           ['OPTION_PWM1', [2, '- period [ms]', 'duty [ms]', 'ORION_COUNTER_PWM_1']],
                           ['OPTION_PWM2', [2, '- period [ms]', 'duty [ms]', 'ORION_COUNTER_PWM_2']],
                           ['OPTION_PWM3', [2, '- period [ms]', 'duty [ms]', 'ORION_COUNTER_PWM_3']],
                           ['OPTION_PWM4', [2, '- period [ms]', 'duty [ms]', 'ORION_COUNTER_PWM_4']]
                           ]);
                     
var pin_count;
var wire_count;
var transformer_state_count;
var transformer_state_dummy;
var transformer_config_count;
var transformer_config_dummy;

var block_count;
var block_id_to_wire_map;

var enable_callbacks = (function() { var enable = false; return { set : function(e) { enable = e; return e; }, get : function() { return enable; } } })();

var crc_demo_code = "\
    uint32_t d, s, t;\r\n\
    uint16_t c = 0; /* demo code is for CRC-16-CCITT */\r\n\n\
    while (cnt--) {\r\n\
        d = (uint32_t)(*src++);\r\n\
        s = d ^ (c >> 8);\r\n\
        t = s ^ (s >> 4);\r\n\
        c = (c << 8) ^ t ^ (t << 5) ^ (t << 12);\r\n\
    }\r\n\
    return (uint32_t)c;\r\n\
}\r\n";


function getPortID(numstr) {
    var port_id_num = Number(numstr);
    if (port_id_num > 9) port_id_num += 7;
    if (port_id_num == 24) port_id_num += 2;    // RX "H"->"J" mapping
    return String.fromCharCode(48 + port_id_num);
}

function findWire(type, id) {
    for (let m of block_id_to_wire_map[type]) {
        if (Number(m[0]) == Number(id)) return m[1];
    }
    return "undefined"; // should not occur
}

function getWireFrom(str) {  
    if (str) {
        var match = str.match(/&w\[[0-9]{1,3}\]/g);  // get output wire (indicated by address symbol "&")
        if (match) {
            if (match.length > 1) match = match.pop();  // get last match
            return String(match).substring(1);   // remove leading "&"
        }
    }
    return "w[undefined]";
}


// extracts code from a connected input, which is either a Wire or a Numeric (Float.1)
function getCodeAndWireFrom(str) {
    // check for numeric value, transform to numeric block
    if (str.charAt(0) == '#') {
        var wire = "w[" + String(wire_count++)  + "]";
        return ["oRIOn_configureNumericBlock(" + String(block_count[block_type.NUMERIC]++) + ", &" + wire + ", " + str.substring(1) + ");\r\n",
                wire];
    }
    // check for code at wire input that is more than just the wire
    if (str.charAt(0) != '&') {
        var wire = getWireFrom(str);
        return [str, wire];
    }    
    // otherwise return no code, "str" is a simple wire variable
    return ["", str.substring(1)];
}


// extracts code from a connected input, which is a Numeric (Float.1)
function getNumericFrom(str) {
    if (str.charAt(0) == '#') {
        return str.substring(1);
    }
    return str;
}


Blockly.JavaScript['openrio_constant'] = function(block) {
  var number_const = block.getFieldValue('CONST');
  // TODO: Assemble JavaScript into code variable.
  var code = 'const float openRIO = ' + number_const;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['openrio_gpio_config'] = function(block) {
  var number_port_name = block.getFieldValue('PORT_NAME');
  var number_pin_name = block.getFieldValue('PIN_NAME');
  var dropdown_function_name = block.getFieldValue('MODE');
  // TODO: Assemble JavaScript into code variable.
  var gpio_mode = ["DIGITAL_IN", "DIGITAL_OUT", "ANALOG_IN", "ANALOG_OUT", "PWM"];
  var mode = gpio_mode[Number(dropdown_function_name)]

  if (mode == 'PWM') {
      //var freq = block.type;    // yields "openRIO_gpio_config"
      //var freq = block.childBlocks_[0].type;  // works when "openRIO_constant" block is inserted for PWM
      //var freq = block.inputList[0].name;   // yields ''
      //var freq = block.getFieldValue('PWM_FREQUENCY');  // yields "null"
      var freq = Blockly.JavaScript.valueToCode(block, 'PWM_FREQUENCY',
          Blockly.JavaScript.ORDER_NONE) || '50';
      mode = mode + ' | PWM_FREQ(' + freq + ')';
  }
  
  var code = 'T_openRIO_GPIO* p' + String(openRIO_gpio_num) + ' = openRIO_declareGPIO(P' + number_port_name +  number_pin_name + ', ' + mode + ');\n';  
  openRIO_gpio_num++;
  return code;
};
        
Blockly.JavaScript['orion_init'] = function(block) { 
  pin_count = 0;
  wire_count = 0;
  transformer_state_count = 0;
  transformer_state_dummy = false;
  transformer_config_count = 0;
  transformer_config_dummy = false;
  block_count = [0, 0, 0, 0, 0];
  block_id_to_wire_map = [[], [], [], [], []];
  
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  
  // parse auto-assigned ID statements
  var a;
  while (true) {
      if (statements.search('input_id') == -1) break;
      statements = statements.replace('input_id', String(block_count[block_type.INPUT]++));
  }
  while (true) {
      if (statements.search('transformer_id') == -1) break;
      statements = statements.replace('transformer_id', String(block_count[block_type.TRANSFORMER]++));
  }
        
  var code = "//-------//\r\n// oRIOn //\r\n//-------//\r\n\r\n";        
  code += "oRIOn_init(" + block_count.join(', ') + ");\r\n\r\n";
  
  if (wire_count > 0) {
      var wire_vars = "T_oRIOn_wire w[" + String(wire_count) + "];\r\n";
      code = code.concat(wire_vars);
  }
  
  if (pin_count > 0) {
      var pin_vars = "T_oRIOn_gpio p[" + String(pin_count) + "];\r\n";
      code = code.concat(pin_vars);
  }

  if (transformer_state_dummy) {
      code = code.concat("const T_oRIOn_transformer_state ts_dummy = { ORION_NULL };\r\n");
  }
  
  if (transformer_state_count > 0) {
      var transformer_state_vars = "T_oRIOn_transformer_state ts[" + String(transformer_state_count) + "];\r\n";
      code = code.concat(transformer_state_vars);
  }
  
  if (transformer_config_dummy) {
      code = code.concat("const T_oRIOn_transformer_config tc_dummy = { ORION_NULL };\r\n");
  }  
  
  if (transformer_config_count > 0) {
      var transformer_config_vars = "T_oRIOn_transformer_config tc[" + String(transformer_config_count) + "];\r\n";
      code = code.concat(transformer_config_vars);
  }
    
  code = code.concat("\r\n" + statements);
  
  return code.concat("oRIOn_setDefinitionStatus(ORION_DEFINITION_READY);\r\noRIOn_requestRun();\r\n");
};

Blockly.JavaScript['orion_pin_container'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  
  var code = statements;
  
  if (code) return code.concat("\r\n");
  
  return code;
};

Blockly.JavaScript['orion_counter_container'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  
  var code = statements;
  
  if (code) return code.concat("\r\n");
  
  return code;
};

Blockly.JavaScript['orion_input_container'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  
  var code = statements;
  
  if (code) return code.concat("\r\n");
  
  return code;
};

Blockly.JavaScript['orion_transformer_container'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  // TODO: Assemble JavaScript into code variable.
  
  var code = statements;
  
  if (code) return code.concat("\r\n");
  
  return code;
};

Blockly.JavaScript['orion_output_container'] = function(block) {
  var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS');
  // TODO: Assemble JavaScript into code variable.
  
  var code = statements;
  
  if (code) return code.concat("\r\n");
  
  return code;
};



//------------//
// PIN BLOCKS //
//------------//

Blockly.JavaScript['orion_config_pin'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------    
    // fields: PORT_ID, PIN_ID, FUNCTION_NAME
    var port_id = getPortID(block.getFieldValue('PORT_ID'));
    var pin_id = block.getFieldValue('PIN_ID');
    var type = pin_functions[block.getFieldValue('TYPE')]; 
    var pin_variable = "&p[" + String(pin_count++) + "]";

    var code = "oRIOn_declareGPIO(" + pin_variable + ", P" + port_id + pin_id + ", " + type + ");\r\n";

    return code;
};

Blockly.JavaScript['orion_input_pin'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------    
    // fields: TYPE, PORT_ID, PIN_ID
    var type = pin_functions[Number(block.getFieldValue('TYPE'))]; 
    var port_id = getPortID(block.getFieldValue('PORT_ID'));
    var pin_id = block.getFieldValue('PIN_ID');

    var pin_variable = "&p[" + String(pin_count++) + "]";
    var code = "oRIOn_declareGPIO(" + pin_variable + ", P" + port_id + pin_id + ", " + type + ");\r\n";

    return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['orion_output_pin'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: INPUT
    // fields: TYPE, PORT_ID, PIN_ID
    var input = Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE) || "";    
    var type = pin_functions[Number(block.getFieldValue('TYPE'))]; 
    var port_id = getPortID(block.getFieldValue('PORT_ID'));
    var pin_id = block.getFieldValue('PIN_ID');

    var pin_variable = "&p[" + String(pin_count++) + "]";
    
    // extract wire from connected output
    if (input) {
        var separation = input.lastIndexOf('\r\n') + 2; // get position of last newline, including newline
        if (separation > 1) {
            var input_fixpart = input.slice(0, separation);            
            var input_varpart = input.slice(separation, input.length).split(',');
        }
        else {
            var input_fixpart = "";
            var input_varpart = input.split(',');
        }
        var wire_variable = input_varpart.shift();
        var block_id = input_varpart.shift();
        if (input_varpart.length > 0) {
            var defaults = input_varpart.join(", ");
        }
        else {
            var defaults = "";
        }
    }
    else {
        var input_fixpart = "";
        var wire_variable = "undefined";
        var block_id = "output_id";
        var defaults = "ORION_ACTIVATE, 0.0";
    }   

    var code = input_fixpart + "oRIOn_declareGPIO(" + pin_variable + ", P" + port_id + pin_id + ", " + type + ");\r\n";    
    code += "oRIOn_configureOutputBlockFromGPIO(" + block_id + ", " + pin_variable + ", " + wire_variable + ", " + defaults + ");\r\n";
 
    return code;
};


//----------------//
// COUNTER BLOCKS //
//----------------//

Blockly.JavaScript['orion_counter'] = function(block) {
    // ---------------------
    // block type: VALUE
    // ---------------------
    // fields: BLOCK_ID
    var block_id = Number(block.getFieldValue('BLOCK_ID')) - 1;
    
    return ["&w[" + findWire(block_type.COUNTER, block_id) + "]", Blockly.JavaScript.ORDER_NONE];   
}

Blockly.JavaScript['orion_configure_counter_mutable'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // optional inputs: CONFIG0, CONFIG1
    // fields: BLOCK_ID, TYPE
    
    var block_id = block.getFieldValue('BLOCK_ID');
    if (block_id > block_count[block_type.COUNTER]) block_count[block_type.COUNTER] = block_id;    
    block_id--;  
 
    var configInputs = counter_map.get(block.getFieldValue('TYPE'))[0];   
    var type = counter_map.get(block.getFieldValue('TYPE'))[3];   
    
    // create new output wire
    var wire_variable = "&w[" + String(wire_count) + "]";      
    block_id_to_wire_map[block_type.COUNTER].push([block_id, wire_count]);
    //console.log("Added: ", block_id_to_wire_map[block_type.INPUT][block_id_to_wire_map[block_type.INPUT].length - 1]);
    wire_count++;    
    
    // sample config inputs
    var configs = ['0', '0'];
    if (configInputs > 0) {
        configs[0] = "ORION_T2T(" + getNumericFrom(Blockly.JavaScript.valueToCode(block, 'CONFIG0', Blockly.JavaScript.ORDER_NONE) || "undefined") + ")";
    }
    if (configInputs > 1) {        
        configs[1] = "ORION_T2T(" + getNumericFrom(Blockly.JavaScript.valueToCode(block, 'CONFIG1', Blockly.JavaScript.ORDER_NONE) || "undefined") + ")";
    }

    // currently, initial values other than 0 are not supported
    var code = "oRIOn_configureCounterBlock(" + block_id + ", " + wire_variable + ", " + type + ", 0, ";
    code += configs[0] + ", " + configs[1] + ");\r\n";   
    
    return code;
}
    

//--------------//
// INPUT BLOCKS //
//--------------//

Blockly.JavaScript['orion_configure_input_from_pin_mutable'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------    
    // fields: TYPE, PORT_ID, PIN_ID
    var type = pin_functions[Number(block.getFieldValue('TYPE'))];   
    var port_id = getPortID(block.getFieldValue('PORT_ID'));
    var pin_id = block.getFieldValue('PIN_ID');
    
    var wire_variable = "&w[" + String(wire_count++) + "]";      
    var pin_variable = "&p[" + String(pin_count++) + "]";    
    
    var block_id = "input_id";  // anonymous input, whose ID is to be replaced later
    var defaults = (Blockly.JavaScript.valueToCode(block, 'CUSTOM_DEFAULTS', Blockly.JavaScript.ORDER_NONE) || "ORION_ACTIVATE, 0.0");    
    
    var code = "oRIOn_declareGPIO(" + pin_variable + ", P" + port_id + pin_id + ", " + type + ");\r\n";
    code += "oRIOn_configureInputBlockFromGPIO(" + block_id + ", " + pin_variable + ", " + wire_variable + ", " + defaults + ");\r\n";
    
    return [code, Blockly.JavaScript.ORDER_NONE];    
};

Blockly.JavaScript['orion_configure_input_mutable'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: INPUT
    // optional inputs: CUSTOM_DEFAULTS  
    // fields: BLOCK_ID
    if (block.getInput('INPUT').connection.isConnected()) {
        var input_type = block.getInput('INPUT').connection.targetBlock().type;
    }
    else {
        var input_type = "";
    }
    
    var input = Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE) || "";
    var defaults = (Blockly.JavaScript.valueToCode(block, 'CUSTOM_DEFAULTS', Blockly.JavaScript.ORDER_NONE) || "ORION_ACTIVATE, 0.0");
    var block_id = block.getFieldValue('BLOCK_ID');
    if (block_id > block_count[block_type.INPUT]) block_count[block_type.INPUT] = block_id;    
    block_id--;    

    // create new output wire
    var wire_variable = "&w[" + String(wire_count) + "]";      
    block_id_to_wire_map[block_type.INPUT].push([block_id, wire_count]);
    //console.log("Added: ", block_id_to_wire_map[block_type.INPUT][block_id_to_wire_map[block_type.INPUT].length - 1]);
    wire_count++;
    
    switch (input_type) {
        case "orion_input_pin" :
            var pin_variable = "&p[" + String(pin_count - 1) + "]";        
        
            var code = input + "oRIOn_configureInputBlockFromGPIO(" + block_id + ", " + pin_variable + ", " + wire_variable + ", " + defaults + ");\r\n";
            break;
        default:
            var code = "oRIOn_configureInputBlock(undefined, " + wire_variable + ", " + defaults + ");\r\n";
    }

    return code;
};

Blockly.JavaScript['orion_input'] = function(block) {
    // ---------------------
    // block type: VALUE
    // ---------------------
    // fields: BLOCK_ID
    var block_id = Number(block.getFieldValue('BLOCK_ID')) - 1;
    
    return ["&w[" + findWire(block_type.INPUT, block_id) + "]", Blockly.JavaScript.ORDER_NONE];   
}


//--------------------//
// TRANSFORMER BLOCKS //
//--------------------//

Blockly.JavaScript['orion_transformer_mutable'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------
    // inputs: INPUT
    // optional inputs: SECOND_INPUT, STATE, CONFIG, CUSTOM_DEFAULTS
    // fields: TYPE
    var input0 = getCodeAndWireFrom(Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE) || "");
    var input1 = getCodeAndWireFrom(Blockly.JavaScript.valueToCode(block, 'SECOND_INPUT', Blockly.JavaScript.ORDER_NONE) || "");
    var state = Blockly.JavaScript.valueToCode(block, 'STATE', Blockly.JavaScript.ORDER_NONE) || "";
    var config = Blockly.JavaScript.valueToCode(block, 'CONFIG', Blockly.JavaScript.ORDER_NONE) || "";
    var defaults = (Blockly.JavaScript.valueToCode(block, 'CUSTOM_DEFAULTS', Blockly.JavaScript.ORDER_NONE) || "ORION_ACTIVATE, 0.0");    
    var block_id = "transformer_id";  // anonymous transformer, whose ID is to be replaced later

    var type = block.getFieldValue('TYPE');      

    // begin building code from connected input(s)
    var code = input0[0] + input1[1];
    
    // extract wire(s) from connected input(s)
    var wire_input0 = input0[1];    
    if (transformer_map.get(type)[0]) {
        var wire_input1 = input1[1];    
    }
    else {        
        var wire_input1 = "NULL";
    }
    
    // create new output wire
    var wire_output = "&w[" + String(wire_count) + "]";      
    block_id_to_wire_map[block_type.TRANSFORMER].push([block_id, wire_count]);
    wire_count++;    

    code += "oRIOn_configureTransformerBlockFull(" + block_id + ", " + wire_input0 + ", " + wire_input1 + ", " + wire_output;
    code += ", " + defaults + ", " + transformer_map.get(type)[3] + ", ts, tc);\r\n";
    
    return [code, Blockly.JavaScript.ORDER_NONE]; 
}    

Blockly.JavaScript['orion_configure_transformer_mutable'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: INPUT
    // optional inputs: SECOND_INPUT, (STATE, static implementation so far), CONFIG, CUSTOM_DEFAULTS
    // fields: BLOCK_ID, TYPE
    var input0 = getCodeAndWireFrom(Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE) || "");
    var input1 = getCodeAndWireFrom(Blockly.JavaScript.valueToCode(block, 'SECOND_INPUT', Blockly.JavaScript.ORDER_NONE) || "");
    //var state = Blockly.JavaScript.valueToCode(block, 'STATE', Blockly.JavaScript.ORDER_NONE) || "";
    var config = Blockly.JavaScript.valueToCode(block, 'CONFIG_INPUT', Blockly.JavaScript.ORDER_NONE) || "undefined";
    var defaults = (Blockly.JavaScript.valueToCode(block, 'CUSTOM_DEFAULTS', Blockly.JavaScript.ORDER_NONE) || "ORION_ACTIVATE, 0.0");    
    var block_id = block.getFieldValue('BLOCK_ID');
    if (block_id > block_count[block_type.TRANSFORMER]) block_count[block_type.TRANSFORMER] = block_id;
    block_id--;

    var type = block.getFieldValue('TYPE');      
    
    // begin building code from connected input(s)
    var code = input0[0] + input1[0];    
    
    // extract wire(s) from connected input(s)
    var wire_input0 = input0[1];    
    if (transformer_map.get(type)[0]) {
        var wire_input1 = input1[1];    
    }
    else {        
        var wire_input1 = "ORION_NULL";
    }
        
    // create new output wire for non-anonymous (numbered) transformer block
    var wire_output = "&w[" + String(wire_count) + "]";      
    block_id_to_wire_map[block_type.TRANSFORMER].push([block_id, wire_count]);
    wire_count++;    

    // create transformer state space, if necessary
    // first state variable is initialized with block's default output, other state variables are initialized with "0.0"
    var state_vars = transformer_map.get(type)[4];
    var transformer_state;
    if (state_vars > 0) {
        transformer_state = "ts[" + String(transformer_state_count++) + "]";
        if (state_vars == 1) {            
            code += transformer_state + ".value =" + defaults.split(',')[1] + ";\r\n";
        }
        else {
            code += "static const float num" + String(block_count[block_type.NUMERIC]) + "[" +  String(state_vars) + " = {" + defaults.split(',')[1];                        
            for (let v = (state_vars - 1); v--; v > 0) {
                code += ", 0.0";
            }
            code += "};\r\n";
            
            code += "oRIOn_configureNumericBlockArray(" + String(block_count[block_type.NUMERIC]) + ", " + String(state_vars);
            code += ", &" + transformer_state + ".addr, num" + String(block_count[block_type.NUMERIC]) + ");\r\n";           
            
            block_count[block_type.NUMERIC] += state_vars;            
        }
    }
    else {
        transformer_state = "ts_dummy";        
        transformer_state_dummy = true;
    }
    
    // create transformer config space, if necessary
    var config_vars = transformer_map.get(type)[5];
    var transformer_config;
    if (config_vars > 0) {
        transformer_config = "tc[" + String(transformer_config_count++) + "]";
        if (config_vars == 1) {
            if (config.search('floatp_id') >= 0) {
                code += config.replace('floatp_id', "&" + transformer_config + ".value");
            }
            else {
                code += transformer_config + ".value = " + config + ";\r\n"
            }
        }
        else {
            code += "static const float num" + String(block_count[block_type.NUMERIC]) + "[" + String(config_vars) + "] = {";            
            if (config.search('floatp_id') >= 0) {                        
                code += "0.0";
                for (let v = (config_vars - 1); v--; v > 0) {
                    code += ", 0.0";
                }
            }
            else {
                code += config;
            }                
            code += "};\r\n";            
                
            code += "oRIOn_configureNumericBlockArray(" + String(block_count[block_type.NUMERIC]) + ", " + String(config_vars);
            code += ", &" + transformer_config + ".addr, num" + String(block_count[block_type.NUMERIC]) + ");\r\n";            
            
            if (config.search('floatp_id') >= 0) {
                code += config.replace('floatp_id', transformer_config + ".addr");
            }          
            
            block_count[block_type.NUMERIC] += config_vars;               
        }
    }
    else {
        transformer_config = "tc_dummy";        
        transformer_config_dummy = true;
    }    
    
    code += "oRIOn_configureTransformerBlockFull(" + block_id + ", " + wire_input0 + ", " + wire_input1 + ", " + wire_output;
    code += ", " + defaults + ", " + transformer_map.get(type)[3] + ", " + transformer_state + ", " + transformer_config + ");\r\n";
    
    return code; 
}    
    
Blockly.JavaScript['orion_transformer'] = function(block) {
    // ---------------------
    // block type: VALUE
    // ---------------------
    // fields: BLOCK_ID
    var block_id = Number(block.getFieldValue('BLOCK_ID')) - 1;
    
    return ["&w[" + findWire(block_type.TRANSFORMER, block_id) + "]", Blockly.JavaScript.ORDER_NONE];   
}    
    

//---------------//
// OUTPUT BLOCKS //
//---------------//

Blockly.JavaScript['orion_configure_output_to_pin_mutable'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: INPUT
    // optional inputs: CUSTOM_DEFAULTS
    // fields: BLOCK_ID, TYPE, PORT_ID, PIN_ID
    var input = getCodeAndWireFrom(Blockly.JavaScript.valueToCode(block, 'INPUT', Blockly.JavaScript.ORDER_NONE) || "");
    var defaults = (Blockly.JavaScript.valueToCode(block, 'CUSTOM_DEFAULTS', Blockly.JavaScript.ORDER_NONE) || "ORION_ACTIVATE, 0.0");    
    var block_id = block.getFieldValue('BLOCK_ID');
    if (block_id > block_count[block_type.OUTPUT]) block_count[block_type.OUTPUT] = block_id;
    block_id--;
    
    var type = pin_functions[Number(block.getFieldValue('TYPE'))];   
    var port_id = getPortID(block.getFieldValue('PORT_ID'));
    var pin_id = block.getFieldValue('PIN_ID');
    
    // begin building code from connected input
    var code = input[0];   
    
    // extract wire from connected input
    var wire_variable = input[1];    
    
    // generate new pin
    var pin_variable = "&p[" + String(pin_count++) + "]";      
    
    code += "oRIOn_declareGPIO(" + pin_variable + ", P" + port_id + pin_id + ", " + type + ");\r\n";
    code += "oRIOn_configureOutputBlockFromGPIO(" + block_id + ", " + wire_variable + ", " + pin_variable + ", " + defaults + ");\r\n";
    
    return code;    
};


//----------------//
// NUMERIC BLOCKS //
//----------------//

Blockly.JavaScript['orion_constant'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------    
    var value = '#' + block.getFieldValue('CONST');
    
    if (!value.includes('.')) value += '.0';
    
    return [value, Blockly.JavaScript.ORDER_NONE];    
}

Blockly.JavaScript['orion_time_constant'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------
    // inputs: VALUE
    // notes: destination float* is not filled in with code here, caller's duty!
    var value = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'VALUE', Blockly.JavaScript.ORDER_NONE) || "undefined");
    
    var code = "oRIOn_timeConstant(floatp_id, " + value + ");\r\n";
    
    return [code, Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['orion_defaults'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------
    // inputs: OUTPUT
    // fields: ACTIVATED
    var output = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'OUTPUT', Blockly.JavaScript.ORDER_NONE) || "undefined");
    var activated = block.getFieldValue('ACTIVATED').split('_')[1];
    
    if (activated == 'YES') activated = "ORION_ACTIVATE";
    else activated = "ORION_STANDBY";      
    
    var code = activated + ", " + output;
    
    return [code, Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['orion_PID_parameters'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------
    // inputs: KP, KI, KD
    // notes: destination float* is not filled in with code here, caller's duty!
    var kp = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'KP', Blockly.JavaScript.ORDER_NONE) || "undefined");
    var ki = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'KI', Blockly.JavaScript.ORDER_NONE) || "undefined");
    var kd = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'KD', Blockly.JavaScript.ORDER_NONE) || "undefined");     
    
    var code = "oRIOn_PIDparameters(floatp_id, " + kp + ", " + ki + ", " + kd + ");\r\n";
    
    return [code, Blockly.JavaScript.ORDER_NONE];
}

Blockly.JavaScript['orion_range'] = function(block) {
    // -----------------
    // block type: VALUE
    // -----------------
    // inputs: MIN, MAX
    // notes: destination float* is not filled in with code here, caller's duty!
    var min = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'MIN', Blockly.JavaScript.ORDER_NONE) || "undefined");
    var max = getNumericFrom(Blockly.JavaScript.valueToCode(block, 'MAX', Blockly.JavaScript.ORDER_NONE) || "undefined");
    
    var code = "oRIOn_range(floatp_id, " + min + ", " + max + ");\r\n";
    
    return [code, Blockly.JavaScript.ORDER_NONE];
}



Blockly.JavaScript['lasso_init'] = function(block) {  
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: STATEMENTS
    // fields: TARGET, DYNASTROBE, CRC, CALLBACKS
    var target = block.getFieldValue('TARGET').split('_')[1];
    var dynastrobe = (block.getFieldValue('DYNASTROBE') == 'OPTION_ON');   // not used for code generation
    var crc = (block.getFieldValue('CRC') == 'OPTION_ON');
    enable_callbacks.set(block.getFieldValue('CALLBACKS') == 'OPTION_ON');
    var callbacks = [];
    var statements = Blockly.JavaScript.statementToCode(block, 'STATEMENTS').split('\r\n');
    
    // default callbacks for lasso_hostRegisterCOM, lasso_hostRegisterDatacell, lasso_hostRegisterMEM
    var user_callbacks = ['while(1);', 'while(1);', 'while(1);'];
        
    var code = "//-------//\r\n// Lasso //\r\n//-------//\r\n\r\n";
    code += "if (lasso_hostRegisterCOM(&lasso_comSetup_" + target + ", &lasso_comCallback_" + target + ", NULL, NULL";
    if (crc) {
        code += ", &lasso_crcCallback_" + target;
        callbacks.push("uint32_t lasso_crcCallback_" + target + "(uint8_t* src, uint32_t cnt) {\r\n" + crc_demo_code);
    }
    code += ")) {\r\n    " + user_callbacks[0] + "\r\n}\r\n\n";
  
    for (let s of statements) {
        if (s != "") {
            code += "if (" + s + ") {\r\n    " + user_callbacks[1] + "\r\n}\r\n\r\n";
            let t = s.substring(s.indexOf('(') + 1).split(',');
            let v = t[5].substring(1, t[5].length - (dynastrobe ? 0 : 1));    
            if (v != "NULL") {
                v = v.substring(1); // remove leading '&'
                let w = t[0].split('|')[0].trim().split('_')[1].toLowerCase();            
                if ((w != 'bool') && (w != 'char') && (w != 'float')) { 
                    w += "_t";
                }
                callbacks.push("bool " + v + "(void* in) {\r\n    " + w + " val = *(" + w + ")in;\r\n\n    /* your code here */\r\n\n    /* return true if value of 'in' is acceptable */\r\n    return true;\r\n}\r\n");
            }
        }
    }
    
    code = code.concat("if (lasso_hostRegisterMEM()) {\r\n    " + user_callbacks[2] + "\r\n}\r\n\r\n");
    
    if ((enable_callbacks.get()) && (callbacks.length > 0)) {
        code += "//-----------------//\r\n// Lasso callbacks //\r\n//-----------------//\r\n\r\n";
        code += callbacks.join('\n');
    }
  
    return code;
};

Blockly.JavaScript['lasso_register_datacell_mutable'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: none
    // fields: ACCESS, VARIABLE, NUMBER, TYPE, ENABLED, FIELDID2 (callback), FIELDID4 (tick period), FIELDID6 (name), FIELDID8 (unit)
    var access = (block.getFieldValue('ACCESS') == "OPTION_WRITEABLE" ? " | LASSO_DATACELL_WRITEABLE" : "");
    var variable = block.getFieldValue('VARIABLE');
    var num = block.getFieldValue('NUMBER');
    var type = block.getFieldValue('TYPE');
    var enabled; 
    switch (block.getFieldValue('ENABLED')) {
        case "OPTION_YES" : { enabled = " | LASSO_DATACELL_ENABLE"; break; }
        case "OPTION_PERMANENT" : { enabled = " | LASSO_DATACELL_PERMANENT"; break; }
        default : { enabled = ""; }
    }
    var callback = ", NULL";  
    if (block.getField('FIELDID2') !== null) {
        callback = ", &".concat(block.getFieldValue('FIELDID2'));
    }
    if (dynastrobe) {
        var tickperiod = ", 1";
    }
    else {
        var tickperiod = "";
    }
    if (block.getField('FIELDID4') !== null) {
        tickperiod = ", ".concat(block.getFieldValue('FIELDID4'));
    }
    var name = variable + "Name";
    if (block.getField('FIELDID6') !== null) {
        name = block.getFieldValue('FIELDID6');
    }
    var unit = "";
    if (block.getField('FIELDID8') !== null) {
        unit = block.getFieldValue('FIELDID8');
    }
    
    return "lasso_hostRegisterDataCell(" + type + access + enabled + ", " + num + ", &" + variable + ", \"" + name + "\", \"" + unit + "\"" + callback + tickperiod + ")\r\n";
};

Blockly.JavaScript['lasso_register_orion_wire_mutable'] = function(block) {
    // ---------------------
    // block type: STATEMENT
    // ---------------------
    // inputs: WIRE_ID
    // fields: ACCESS, ENABLED, FIELDID2 (callback), FIELDID4 (tick period), FIELDID6 (name), FIELDID8 (unit)
    var input = getCodeAndWireFrom(Blockly.JavaScript.valueToCode(block, 'WIRE_ID', Blockly.JavaScript.ORDER_NONE) || "");    
    var access = (block.getFieldValue('ACCESS') == "OPTION_WRITEABLE" ? " | LASSO_DATACELL_WRITEABLE" : "");
    var enabled; 
    switch (block.getFieldValue('ENABLED')) {
        case "OPTION_YES" : { enabled = " | LASSO_DATACELL_ENABLE"; break; }
        case "OPTION_PERMANENT" : { enabled = " | LASSO_DATACELL_PERMANENT"; break; }
        default : { enabled = ""; }
    }
    var callback = ", NULL";  
    if (block.getField('FIELDID2') !== null) {
        callback = ", &".concat(block.getFieldValue('FIELDID2'));
    }
    if (dynastrobe) {
        var tickperiod = ", 1";
    }
    else {
        var tickperiod = "";
    }
    if (block.getField('FIELDID4') !== null) {
        tickperiod = ", ".concat(block.getFieldValue('FIELDID4'));
    }  
    var name = wire_variable;
    if (block.getField('FIELDID6') !== null) {
        name = block.getFieldValue('FIELDID6');
    }
    var unit = "";
    if (block.getField('FIELDID8') !== null) {
        unit = block.getFieldValue('FIELDID8');
    }    
    
    // begin building code from connected input
    var code = input[0];   
    
    // extract wire from connected input
    var wire_variable = input[1];  
    
    code += "lasso_hostRegisterDataCell(LASSO_FLOAT" + access + enabled + ", 1, &" + wire_variable + ", \"" + name + "\", \"" + unit + "\"" + callback + tickperiod + ")\r\n";
    
    return code;
};
