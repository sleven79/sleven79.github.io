'use strict';

goog.provide('Blockly.Constants.oRIOn');
goog.provide('Blockly.Constants.lasso');

goog.require('Blockly.Blocks');
goog.require('Blockly.Field');
goog.require('Blockly');


//---------------------//
// BLOCK ID OPERATIONS //
//---------------------//

const block_type = { COUNTER: 0, INPUT: 1, TRANSFORMER: 2, OUTPUT: 3, NUMERIC: 4};

const block_type_map = new Map([['orion_counter', 0],
                                ['orion_group_counter', 0],
                                ['orion_input', 1],
                                ['orion_group_input', 1],
                                ['orion_transformer', 2],
                                ['orion_group_transformer', 3],
                                ['orion_group_output', 4]
                                ]);

const block_types = [[['orion_configure_counter_mutable'], ['orion_counter']],
                   [['orion_configure_input_mutable'], ['orion_input', 'orion_group_input']],
                   [['orion_configure_transformer_mutable'], ['orion_transformer', 'orion_group_transformer']],
                   [['orion_configure_output_to_pin_mutable'], ['orion_output', 'orion_group_output']],
                   [[], []]
                   ];

var dynastrobe = false;

function* generateBlockTypes() {
    // [ [blocks with auto-assigned IDs], [associated blocks with user-assigned IDs] ]
    for (let t of block_types) {
        yield t;
    }
}

function* generateSpecificBlockTypes(index, user) {
    for (let t of block_types[index][user]) {
        yield t;
    }
}

function getNextFreeID(workspace, type) {
    var nextID = 0;
    for (let t of block_types[type][0]) {
        nextID += workspace.getBlocksByType(t).length;
    }
    return nextID;
}


//-----------------------//
// MAIN AND GROUP BLOCKS //
//-----------------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_init",
  "message0": " oRIOn main %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Config"
    }
  ],
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
},
{
  "type": "orion_pin_container",
  "message0": "Pins %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Pin"
    }
  ],
  "previousStatement": "Config",
  "nextStatement": "Config",
  "colour": 315,
  "tooltip": "oRIOn block configuration",
  "helpUrl": ""
},
{
  "type": "orion_counter_container",
  "message0": "Counters %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Counter"
    }
  ],
  "previousStatement": "Config",
  "nextStatement": "Config",
  "colour": 100,
  "tooltip": "oRIOn counter block configuration",
  "helpUrl": ""
},
{
  "type": "orion_input_container",
  "message0": "Inputs %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Input"
    }
  ],
  "previousStatement": "Config",
  "nextStatement": "Config",
  "colour": 150,
  "tooltip": "oRIOn input block configuration",
  "helpUrl": ""
},
{
  "type": "orion_transformer_container",
  "message0": "Transformers %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Transformer"
    }
  ],
  "previousStatement": "Config",
  "nextStatement": "Config",
  "colour": 0,
  "tooltip": "oRIOn transformer block configuration",
  "helpUrl": ""
},
{
  "type": "orion_output_container",
  "message0": "Outputs %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Output"
    }
  ],
  "previousStatement": "Config",
  "nextStatement": "Config",
  "colour": 270,
  "tooltip": "oRIOn block configuration",
  "helpUrl": ""
},
{
  "type": "orion_group",
  "message0": " oRIOn group %1 %2 Active on startup? %3",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "Group"
    },
    {
      "type": "input_value",
      "name": "DEFAULT_ACTIVATION",
      "check": "Boolean"
    }
  ],
  "colour": 230,
  "tooltip": "",
  "helpUrl": ""
}
]);



//------------//
// PIN BLOCKS //
//------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_config_pin",
  "message0": "Port %1 Pin %2 as %3",
  "args0": [
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital input",
          "0"
        ],
        [
          "digital output",
          "1"
        ],
        [
          "analog input",
          "2"
        ],
        [
          "analog output",
          "3"
        ]
      ]
    }
  ],
  "previousStatement": "Pin",
  "nextStatement": "Pin",
  "colour": 315,
  "tooltip": "oRIOn GPIO configuration",
  "helpUrl": ""
},
{
  "type": "orion_input_pin",
  "message0": "%1 Port %2 Pin %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "0"
        ],
        [
          "analog",
          "2"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    }
  ],
  "output": "Pin",
  "colour": 315,
  "tooltip": "oRIOn GPIO declaration",
  "helpUrl": ""
}
]);

/*
{
  "type": "orion_input_pin",
  "message0": "%1 Port %2 Pin %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "0"
        ],
        [
          "analog",
          "2"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    }
  ],
  "output": "Pin",
  "colour": 315,
  "tooltip": "oRIOn GPIO declaration",
  "helpUrl": ""
},
{
  "type": "orion_output_pin",
  "message0": "Connect %1 Port %2 Pin %3 to %4",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "1"
        ],
        [
          "analog",
          "3"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": "Output"
    }
  ],
  "inputsInline": false,
  "previousStatement": "Pin",
  "nextStatement": "Pin",
  "colour": 315,
  "tooltip": "oRIOn output pin",
  "helpUrl": ""
}
*/



//----------------//
// COUNTER BLOCKS //
//----------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_counter",
  "message0": "counter [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 100,
  "tooltip": "oRIOn counter block",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_group_counter",
  "message0": "Group counter [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "previousStatement": "Group",
  "nextStatement": "Group",
  "colour": 100,
  "tooltip": "oRIOn group counter",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_configure_counter_mutable",
  "message0": "[ %1 ] - %2",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "Free running",
          "OPTION_FREE_RUNNING"
        ],
        [
          "Periodic",
          "OPTION_PERIODIC"
        ],
        [
          "PWM (duty/stop=1/0)",
          "OPTION_PWM1"
        ],
        [
          "PWM (duty/stop=0/0)",
          "OPTION_PWM2"
        ],
        [
          "PWM (duty/stop=1/1)",
          "OPTION_PWM3"
        ],
        [
          "PWM (duty/stop=0/1)",
          "OPTION_PWM4"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "previousStatement": "Counter",
  "nextStatement": "Counter",
  "colour": 100,
  "tooltip": "oRIOn counter block",
  "helpUrl": "",
  "mutator": "orion_configure_counter_mutator",
  "extensions": ["orion_configure_counter_extension"]
}
]);


/**
 * Mixin for mutator functions in the 'orion_configure_counter_mutator' extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.COUNTER_MUTATOR_MIXIN = {
  type_: 'OPTION_FREE_RUNNING',
  configInputs_: [false, false],
  /**
   * Create XML to represent whether the 'configInputs_' input(s) should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = null;
    if (this.configInputs_[0] || this.configInputs_[1]) {
        container = document.createElement('mutation');
        this.type_ = container.setAttribute('type', this.type_);
        for (let i = 0; i < 2; i++) {
            if (this.configInputs_[i]) container.setAttribute('configInput' + String(i), true);
        }
    }
    return container;
  },
  /**
   * Parse XML to restore the 'configInputs_' input(s).
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.type_ = xmlElement.getAttribute('type');
    for (let i = 0; i < 2; i++) {
        this.configInput_[i] = (xmlElement.getAttribute('configInput' + String(i)) == 'true');
    }
    this.updateShape_();
  },
  /**
   * Modify the original block to have (or not have) an input for 'Defaults to'.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    for (let i = 0; i < 2; i++) {
        let configInputExists = this.getInput('CONFIG' + String(i));
        if (this.configInputs_[i]) {
          if (!configInputExists) {
            this.appendValueInput('CONFIG' + String(i))
                .setCheck('Float.1')
                .setAlign(Blockly.ALIGN_RIGHT)
                .appendField(counter_map.get(this.type_)[i + 1]);
          }
        } else if (configInputExists) {
          this.removeInput('CONFIG' + String(i));
        }
    }
  }
};

/**
 * Helper function is run on the block after it is instantiated and the mixin object is added.
 * Here: sets validator callback for transformer type selector.
 * @this Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.COUNTER_MUTATOR_EXTENSION = function() {
  this.getField('TYPE').setValidator(function(option) {
    this.sourceBlock_.type_ = option;
    this.sourceBlock_.configInputs_ = [counter_map.get(option)[0] > 0, counter_map.get(option)[0] > 1];
    this.sourceBlock_.updateShape_();
  });
}

Blockly.Extensions.registerMutator('orion_configure_counter_mutator',
    Blockly.Constants.oRIOn.COUNTER_MUTATOR_MIXIN,
    Blockly.Constants.oRIOn.COUNTER_MUTATOR_EXTENSION);

/**
 * Extension to automatically set the counter ID as a function of the workspace's existing counter set.
 * Called once on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('orion_configure_counter_extension',
    function() {
        var field = this.getField('BLOCK_ID');
        field.EDITABLE = false;
        if (this.workspace) {
            field.setValue(getNextFreeID(this.workspace, block_type.COUNTER));
        }
    }
);


//--------------//
// INPUT BLOCKS //
//--------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_input",
  "message0": "input [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 150,
  "tooltip": "oRIOn input block",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_group_input",
  "message0": "Group input [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "previousStatement": "Group",
  "nextStatement": "Group",
  "colour": 150,
  "tooltip": "oRIOn group input",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_configure_input_mutable",
  "message0": "[ %1 ] - reads %2",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": "Pin"
    }
  ],
  "inputsInline": false,
  "previousStatement": "Input",
  "nextStatement": "Input",
  "colour": 150,
  "tooltip": "oRIOn input block",
  "helpUrl": "",
  "mutator": "orion_configure_input_mutator",
  "extensions": ["orion_configure_input_extension"]
},
{
  "type": "orion_configure_input_mutable_base",
  "message0": "[ %1 ] - reads %2 %3",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "input_value",
      "name": "CONFIGURATION",
      "check": "Pin"
    },
    {
      "type": "input_statement",
      "name": "DEFAULTS"
    }
  ],
  "inputsInline": false,
  "previousStatement": "Input",
  "nextStatement": "Input",
  "colour": 150,
  "tooltip": "oRIOn input block",
  "helpUrl": ""
},
{
  "type": "orion_configure_input_from_pin_mutable",
  "message0": "input from %1 Port %2 Pin %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "0"
        ],
        [
          "analog",
          "2"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 150,
  "tooltip": "oRIOn anonymous input-from-pin block",
  "helpUrl": "",
  "mutator": "orion_configure_input_mutator"
},
{
  "type": "orion_configure_input_from_pin_mutable_base",
  "message0": "input from %1 Port %2 Pin %3 %4 %5",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "0"
        ],
        [
          "analog",
          "2"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "DEFAULTS"
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 150,
  "tooltip": "oRIOn anonymous input-from-pin block",
  "helpUrl": ""
}
]);

/**
 * Mixin for mutator functions in the 'orion_configure_input_mutator' extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.INPUT_MUTATOR_MIXIN = {
  customDefaults_: false,
  /**
   * Create XML to represent whether the 'Defaults to' input should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = null;
    if (this.customDefaults_) {
        container = document.createElement('mutation');
        container.setAttribute('customDefaults', true);
    }
    //alert('MutationToDom: ' + (container != null));
    return container;
  },
  /**
   * Parse XML to restore the 'Defaults to' input.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.customDefaults_ = (xmlElement.getAttribute('customDefaults') == 'true');
    this.updateShape_();
    //alert('DomToMutation: ' + this.customDefaults_);
  },
  /**
   * Populate mutator's workspace by decomposing original block.
   * @param {!Blockly.Workspace} workspace mutator's workspace.
   * @return {!Blockly.Block} root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
      var topBlock = workspace.newBlock(this.type + '_base');
      topBlock.initSvg();

      // copy current settings of underlying block
      if (this.type == 'orion_configure_input_mutable') {
          topBlock.getField('BLOCK_ID').setValue(this.getField('BLOCK_ID').getValue());
          topBlock.getField('BLOCK_ID').EDITABLE = false;
      }
      else {
          topBlock.getField('TYPE').setValue(this.getField('TYPE').getValue());
          topBlock.getField('PORT_ID').setValue(this.getField('PORT_ID').getValue());
          topBlock.getField('PIN_ID').setValue(this.getField('PIN_ID').getValue());
      }

      if (this.customDefaults_) {
        var connection = topBlock.getFirstStatementConnection();
        var subBlock = workspace.newBlock('orion_custom_defaults_mutable_option');
        subBlock.initSvg();
        connection.connect(subBlock.previousConnection);
      }

      return topBlock;
  },
  /**
   * Save mutator dialog's content to original block.
   * @param {!Blockly.Block} topBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(topBlock) {
      this.customDefaults_ = (topBlock.getFirstStatementConnection().targetBlock() != null);

      if (this.type == 'orion_configure_input_mutable') {
          this.getField('BLOCK_ID').setValue(topBlock.getField('BLOCK_ID').getValue());
      }
      else {
        this.getField('TYPE').setValue(topBlock.getField('TYPE').getValue());
        this.getField('PORT_ID').setValue(topBlock.getField('PORT_ID').getValue());
        this.getField('PIN_ID').setValue(topBlock.getField('PIN_ID').getValue());
      }
      this.updateShape_();  // update original block in underlying workspace
  },
  /**
   * Modify the original block to have (or not have) an input for 'Defaults to'.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var inputExists = this.getInput('CUSTOM_DEFAULTS');
    if (this.customDefaults_) {
      if (!inputExists) {
        this.appendValueInput('CUSTOM_DEFAULTS')
            .setCheck('Defaults')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('Defaults:');
      }
    } else if (inputExists) {
      this.removeInput('CUSTOM_DEFAULTS');
    }
  }
};

Blockly.Extensions.registerMutator('orion_configure_input_mutator',
    Blockly.Constants.oRIOn.INPUT_MUTATOR_MIXIN,
    null,
    ['orion_custom_defaults_mutable_option']);

/**
 * Extension to automatically set the input # as a function of the workspace's existing input set.
 * Called once on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('orion_configure_input_extension',
    function() {
        var field = this.getField('BLOCK_ID');
        field.EDITABLE = false;
        if (this.workspace) {
            field.setValue(getNextFreeID(this.workspace, block_type.INPUT));
            //alert('Block created');
        }
    }
);


//--------------------//
// TRANSFORMER BLOCKS //
//--------------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_transformer",
  "message0": "transformer [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 0,
  "tooltip": "oRIOn transformer block",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_group_transformer",
  "message0": "Group transformer [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "previousStatement": "Group",
  "nextStatement": "Group",
  "colour": 0,
  "tooltip": "oRIOn group transformer",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_configure_transformer_mutable",
  "message0": "[ %1 ] - %2 %3",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "negates",
          "OPTION_NEG"
        ],
        [
          "adds",
          "OPTION_ADD"
        ],
        [
          "subtracts",
          "OPTION_SUB"
        ],
        [
          "multiplies",
          "OPTION_MUL"
        ],
        [
          "divides",
          "OPTION_DIV"
        ],
        [
          "filters (LP)",
          "OPTION_LPF"
        ],
        [
          "integrates",
          "OPTION_INTEGRATE"
        ],
        [
          "derives",
          "OPTION_DERIVE"
        ],
        [
          "filters (PID)",
          "OPTION_PID"
        ],
        [
          "1/sqrt()",
          "OPTION_INVSQRT"
        ],
        [
          "sqrt()",
          "OPTION_SQRT"
        ],
        [
          "tan()",
          "OPTION_TAN"
        ],
        [
          "cot()",
          "OPTION_COT"
        ],
        [
          "fastexp()",
          "OPTION_FASTEXP"
        ],
        [
          "power(2)",
          "OPTION_POW2"
        ],
        [
          "exp()",
          "OPTION_EXP"
        ],
        [
          "log(2)",
          "OPTION_LOG2"
        ],
        [
          "ln()",
          "OPTION_LN"
        ],
        [
          "log(10)",
          "OPTION_LOG"
        ],
        [
          "atan()",
          "OPTION_ATAN"
        ],
        [
          "atan2()",
          "OPTION_ATAN2"
        ],
        [
          "sin()",
          "OPTION_SIN"
        ],
        [
          "cos()",
          "OPTION_COS"
        ],
        [
          "limits",
          "OPTION_LIM"
        ],
        [
          "abs()",
          "OPTION_ABS"
        ],
        [
          "ceil()",
          "OPTION_CEIL"
        ],
        [
          "floor()",
          "OPTION_FLOOR"
        ],
        [
          "mod()",
          "OPTION_MOD"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": ["Wire", "Float.1"]
    }
  ],
  "inputsInline": false,
  "previousStatement": "Transformer",
  "nextStatement": "Transformer",
  "colour": 0,
  "tooltip": "oRIOn transformer block",
  "helpUrl": "",
  "mutator": "orion_configure_transformer_mutator",
  "extensions": ["orion_configure_transformer_extension"]
},
{
  "type": "orion_configure_transformer_mutable_base",
  "message0": "[ %1 ] - %2 %3 %4",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "negates",
          "OPTION_NEG"
        ],
        [
          "adds",
          "OPTION_ADD"
        ],
        [
          "subtracts",
          "OPTION_SUB"
        ],
        [
          "multiplies",
          "OPTION_MUL"
        ],
        [
          "divides",
          "OPTION_DIV"
        ],
        [
          "filters (LP)",
          "OPTION_LPF"
        ],
        [
          "integrates",
          "OPTION_INTEGRATE"
        ],
        [
          "derives",
          "OPTION_DERIVE"
        ],
        [
          "filters (PID)",
          "OPTION_PID"
        ],
        [
          "1/sqrt()",
          "OPTION_INVSQRT"
        ],
        [
          "sqrt()",
          "OPTION_SQRT"
        ],
        [
          "tan()",
          "OPTION_TAN"
        ],
        [
          "cot()",
          "OPTION_COT"
        ],
        [
          "fastexp()",
          "OPTION_FASTEXP"
        ],
        [
          "power(2)",
          "OPTION_POW2"
        ],
        [
          "exp()",
          "OPTION_EXP"
        ],
        [
          "log(2)",
          "OPTION_LOG2"
        ],
        [
          "ln()",
          "OPTION_LN"
        ],
        [
          "log(10)",
          "OPTION_LOG"
        ],
        [
          "atan()",
          "OPTION_ATAN"
        ],
        [
          "atan2()",
          "OPTION_ATAN2"
        ],
        [
          "sin()",
          "OPTION_SIN"
        ],
        [
          "cos()",
          "OPTION_COS"
        ],
        [
          "limits",
          "OPTION_LIM"
        ],
        [
          "abs()",
          "OPTION_ABS"
        ],
        [
          "ceil()",
          "OPTION_CEIL"
        ],
        [
          "floor()",
          "OPTION_FLOOR"
        ],
        [
          "mod()",
          "OPTION_MOD"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": ["Wire", "Float.1"]
    },
    {
      "type": "input_statement",
      "name": "DEFAULTS"
    }
  ],
  "inputsInline": false,
  "previousStatement": "Transformer",
  "nextStatement": "Transformer",
  "colour": 0,
  "tooltip": "oRIOn transformer block",
  "helpUrl": ""
},
{
  "type": "orion_transformer_mutable",
  "message0": "%1 %2",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "negates",
          "OPTION_NEG"
        ],
        [
          "adds",
          "OPTION_ADD"
        ],
        [
          "subtracts",
          "OPTION_SUB"
        ],
        [
          "multiplies",
          "OPTION_MUL"
        ],
        [
          "divides",
          "OPTION_DIV"
        ],
        [
          "filters (LP)",
          "OPTION_LPF"
        ],
        [
          "integrates",
          "OPTION_INTEGRATE"
        ],
        [
          "derives",
          "OPTION_DERIVE"
        ],
        [
          "filters (PID)",
          "OPTION_PID"
        ],
        [
          "1/sqrt()",
          "OPTION_INVSQRT"
        ],
        [
          "sqrt()",
          "OPTION_SQRT"
        ],
        [
          "tan()",
          "OPTION_TAN"
        ],
        [
          "cot()",
          "OPTION_COT"
        ],
        [
          "fastexp()",
          "OPTION_FASTEXP"
        ],
        [
          "power(2)",
          "OPTION_POW2"
        ],
        [
          "exp()",
          "OPTION_EXP"
        ],
        [
          "log(2)",
          "OPTION_LOG2"
        ],
        [
          "ln()",
          "OPTION_LN"
        ],
        [
          "log(10)",
          "OPTION_LOG"
        ],
        [
          "atan()",
          "OPTION_ATAN"
        ],
        [
          "atan2()",
          "OPTION_ATAN2"
        ],
        [
          "sin()",
          "OPTION_SIN"
        ],
        [
          "cos()",
          "OPTION_COS"
        ],
        [
          "limits",
          "OPTION_LIM"
        ],
        [
          "abs()",
          "OPTION_ABS"
        ],
        [
          "ceil()",
          "OPTION_CEIL"
        ],
        [
          "floor()",
          "OPTION_FLOOR"
        ],
        [
          "mod()",
          "OPTION_MOD"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": ["Wire", "Float.1"]
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 0,
  "tooltip": "oRIOn anonymous transformer block",
  "helpUrl": "",
  "mutator": "orion_configure_transformer_mutator"
},
{
  "type": "orion_transformer_mutable_base",
  "message0": "%1 %2 %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "negates",
          "OPTION_NEG"
        ],
        [
          "adds",
          "OPTION_ADD"
        ],
        [
          "subtracts",
          "OPTION_SUB"
        ],
        [
          "multiplies",
          "OPTION_MUL"
        ],
        [
          "divides",
          "OPTION_DIV"
        ],
        [
          "filters (LP)",
          "OPTION_LPF"
        ],
        [
          "integrates",
          "OPTION_INTEGRATE"
        ],
        [
          "derives",
          "OPTION_DERIVE"
        ],
        [
          "filters (PID)",
          "OPTION_PID"
        ],
        [
          "1/sqrt()",
          "OPTION_INVSQRT"
        ],
        [
          "sqrt()",
          "OPTION_SQRT"
        ],
        [
          "tan()",
          "OPTION_TAN"
        ],
        [
          "cot()",
          "OPTION_COT"
        ],
        [
          "fastexp()",
          "OPTION_FASTEXP"
        ],
        [
          "power(2)",
          "OPTION_POW2"
        ],
        [
          "exp()",
          "OPTION_EXP"
        ],
        [
          "log(2)",
          "OPTION_LOG2"
        ],
        [
          "ln()",
          "OPTION_LN"
        ],
        [
          "log(10)",
          "OPTION_LOG"
        ],
        [
          "atan()",
          "OPTION_ATAN"
        ],
        [
          "atan2()",
          "OPTION_ATAN2"
        ],
        [
          "sin()",
          "OPTION_SIN"
        ],
        [
          "cos()",
          "OPTION_COS"
        ],
        [
          "limits",
          "OPTION_LIM"
        ],
        [
          "abs()",
          "OPTION_ABS"
        ],
        [
          "ceil()",
          "OPTION_CEIL"
        ],
        [
          "floor()",
          "OPTION_FLOOR"
        ],
        [
          "mod()",
          "OPTION_MOD"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": ["Wire", "Float.1"]
    },
    {
      "type": "input_statement",
      "name": "DEFAULTS"
    }
  ],
  "inputsInline": false,
  "output": "Wire",
  "colour": 0,
  "tooltip": "oRIOn anonymous transformer block",
  "helpUrl": ""
}
]);


/**
 * Mixin for mutator functions in the 'orion_configure_transformer_mutator' extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.TRANSFORMER_MUTATOR_MIXIN = {
  operation_: 'OPTION_NEG',
  secondInput_: false,
  configInput_: false,
  customDefaults_: false,

  /**
   * Create XML to represent whether the 'Defaults to:' input should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = null;
    if (this.customDefaults_ || this.secondInput_) {
        container = document.createElement('mutation');
        container.setAttribute('operation', this.operation_);

        if (this.secondInput_) {
            container.setAttribute('secondInput', true);
        }

        if (this.configInput_) {
            container.setAttribute('configInput', true);
        }

        if (this.customDefaults_) {
            container.setAttribute('customDefaults', true);
        }
    }
    //consol.log('MutationToDom: ' + container);
    return container;
  },
  /**
   * Parse XML to restore the 'Defaults to:' input.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.operation_ = xmlElement.getAttribute('operation');
    this.secondInput_ = (xmlElement.getAttribute('secondInput') == 'true');
    this.configInput_ = (xmlElement.getAttribute('configInput') == 'true');
    this.customDefaults_ = (xmlElement.getAttribute('customDefaults') == 'true');
    this.updateShape_();
    //console.log('DomToMutation: ' + this.operation_ + ' ' + this.secondInput_ + ' ' + this.configInput_ + ' ' + this.customDefaults_);
  },
  /**
   * Populate mutator's workspace by decomposing original block.
   * @param {!Blockly.Workspace} workspace mutator's workspace.
   * @return {!Blockly.Block} root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
      var topBlock = workspace.newBlock(this.type + '_base');
      topBlock.initSvg();

      // copy current settings of underlying block
      if (this.type == 'orion_configure_transformer_mutable') {
          topBlock.getField('BLOCK_ID').setValue(this.getField('BLOCK_ID').getValue());
          topBlock.getField('BLOCK_ID').EDITABLE = false;
      }
      topBlock.getField('TYPE').setValue(this.getField('TYPE').getValue());
      topBlock.getField('TYPE').EDITABLE = false;

      // connect subblock(s), if present
      if (this.customDefaults_) {
        var connection = topBlock.getFirstStatementConnection();
        var subBlock = workspace.newBlock('orion_custom_defaults_mutable_option');
        subBlock.initSvg();
        connection.connect(subBlock.previousConnection);
      }

      return topBlock;
  },
  /**
   * Save mutator dialog's content to original block.
   * @param {!Blockly.Block} topBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(topBlock) {
      this.customDefaults_ = (topBlock.getFirstStatementConnection().targetBlock() != null);

      if (this.type == 'orion_configure_transformer_mutable') {
          this.getField('BLOCK_ID').setValue(topBlock.getField('BLOCK_ID').getValue());
      }
      this.getField('TYPE').setValue(topBlock.getField('TYPE').getValue());

      this.updateShape_();  // update original block in underlying workspace
  },
  /**
   * Modify the original block to have (or not have) additional inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var secondInputExists = this.getInput('SECOND_INPUT');
    var secondInputConnection = null;
    var configInputExists = this.getInput('CONFIG_INPUT');
    var configInputConnection = null;
    var customDefaultsInputExists = this.getInput('CUSTOM_DEFAULTS');
    var customDefaultsInputConnection = null;

    // remove inputs but save connections
    if (secondInputExists) {
        secondInputConnection = secondInputExists.connection.targetConnection;
        this.removeInput('SECOND_INPUT');
    }
    if (configInputExists) {
        configInputConnection = configInputExists.connection.targetConnection;
        this.removeInput('CONFIG_INPUT');
    }
    if (customDefaultsInputExists) {
        customDefaultsInputConnection = customDefaultsInputExists.connection.targetConnection;
        this.removeInput('CUSTOM_DEFAULTS');
    }

    // reinstall inputs and reconnect
    if (this.secondInput_) {
        this.appendValueInput('SECOND_INPUT')
            .setCheck(['Wire', "Float.1"])
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(transformer_map.get(this.operation_)[2]);
        Blockly.Mutator.reconnect(secondInputConnection, this, 'SECOND_INPUT');
    }
    if (this.configInput_) {
        this.appendValueInput('CONFIG_INPUT')
            .setCheck('Float.' + String(transformer_map.get(this.operation_)[5]))
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('Configuration:');
        if (configInputConnection) {
            if (configInputConnection.checkType_(this.getInput('CONFIG_INPUT').connection)) {
                Blockly.Mutator.reconnect(configInputConnection, this, 'CONFIG_INPUT');
            }
        }
    }
    if (this.customDefaults_) {
        this.appendValueInput('CUSTOM_DEFAULTS')
            .setCheck('Defaults')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('Defaults:');
        Blockly.Mutator.reconnect(customDefaultsInputConnection, this, 'CUSTOM_DEFAULTS');
    }
  }
};

/**
 * Helper function is run on the block after it is instantiated and the mixin object is added.
 * Here: sets validator callback for transformer type selector.
 * @this Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.TRANSFORMER_MUTATOR_EXTENSION = function() {
  this.getField('TYPE').setValidator(function(option) {
    this.sourceBlock_.secondInput_ = transformer_map.get(option)[0];
    this.sourceBlock_.configInput_ = (transformer_map.get(option)[5] > 0);
    this.sourceBlock_.operation_ = option;
    this.sourceBlock_.updateShape_();
  });
}

Blockly.Extensions.registerMutator('orion_configure_transformer_mutator',
    Blockly.Constants.oRIOn.TRANSFORMER_MUTATOR_MIXIN,
    Blockly.Constants.oRIOn.TRANSFORMER_MUTATOR_EXTENSION,
    ['orion_custom_defaults_mutable_option']);

/**
 * Extension to auto-assigne set the transformer ID as a function of the workspace's existing transformer set.
 * Called on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('orion_configure_transformer_extension',
    function() {
        var field = this.getField('BLOCK_ID');
        field.EDITABLE = false;
        if (this.workspace) {
            field.setValue(getNextFreeID(this.workspace, block_type.TRANSFORMER));
        }
    }
);


//---------------//
// OUTPUT BLOCKS //
//---------------//


Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_group_output",
  "message0": "Group output [ %1 ]",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    }
  ],
  "inputsInline": false,
  "previousStatement": "Group",
  "nextStatement": "Group",
  "colour": 270,
  "tooltip": "oRIOn group output",
  "helpUrl": "",
  "extensions": ["orion_extension"]
},
{
  "type": "orion_configure_output_to_pin_mutable",
  "message0": "[ %1 ] - writes to %2 Port %3 Pin %4 from %5",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "1"
        ],
        [
          "analog",
          "3"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": ["Wire", "Float.1"]
    }
  ],
  "inputsInline": false,
  "previousStatement": "Output",
  "nextStatement": "Output",
  "colour": 270,
  "tooltip": "oRIOn output-to-pin block",
  "helpUrl": "",
  "mutator": "orion_configure_output_mutator",
  "extensions": ["orion_configure_output_extension"]
},
{
  "type": "orion_configure_output_to_pin_mutable_base",
  "message0": "[ %1 ] - writes to %2 Port %3 Pin %4 from %5 %6",
  "args0": [
    {
      "type": "field_number",
      "name": "BLOCK_ID",
      "value": 1,
      "min": 1,
      "max": 256,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "digital",
          "1"
        ],
        [
          "analog",
          "3"
        ]
      ]
    },
    {
      "type": "field_number",
      "name": "PORT_ID",
      "value": 0,
      "min": 0,
      "max": 17,
      "precision": 1
    },
    {
      "type": "field_number",
      "name": "PIN_ID",
      "value": 0,
      "min": 0,
      "max": 7,
      "precision": 1
    },
    {
      "type": "input_value",
      "name": "INPUT",
      "check": ["Wire", "Float.1"]
    },
    {
      "type": "input_statement",
      "name": "DEFAULTS"
    }
  ],
  "inputsInline": false,
  "previousStatement": "Output",
  "nextStatement": "Output",
  "colour": 270,
  "tooltip": "oRIOn output-to-pin block",
  "helpUrl": ""
}
]);


/**
 * Mixin for mutator functions in the 'orion_output_mutator' extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.OUTPUT_MUTATOR_MIXIN = {
  customDefaults_: false,
  /**
   * Create XML to represent whether the 'Defaults to' input should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = null;
    
    //console.log('mutationToDom');
    //console.log(this.customDefaults_);
    
    if (this.customDefaults_) {
        container = document.createElement('mutation');
        container.setAttribute('customDefaults', true);
    }
    return container;
  },
  /**
   * Parse XML to restore the 'Defaults to' input.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.customDefaults_ = (xmlElement.getAttribute('customDefaults') == 'true');
    this.updateShape_();
    //alert('DomToMutation: ' + this.customDefaults_);
  },
  /**
   * Populate mutator's workspace by decomposing original block.
   * @param {!Blockly.Workspace} workspace mutator's workspace.
   * @return {!Blockly.Block} root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
      var topBlock = workspace.newBlock(this.type + '_base');
      topBlock.initSvg();

      // copy current settings of underlying block
      if (this.type == 'orion_configure_output_mutable') {
          topBlock.getField('BLOCK_ID').setValue(this.getField('BLOCK_ID').getValue());
          topBlock.getField('BLOCK_ID').EDITABLE = false;
      }
      else {
          topBlock.getField('BLOCK_ID').setValue(this.getField('BLOCK_ID').getValue());
          topBlock.getField('BLOCK_ID').EDITABLE = false;
          topBlock.getField('TYPE').setValue(this.getField('TYPE').getValue());
          topBlock.getField('PORT_ID').setValue(this.getField('PORT_ID').getValue());
          topBlock.getField('PIN_ID').setValue(this.getField('PIN_ID').getValue());
      }

      if (this.customDefaults_) {
        var connection = topBlock.getFirstStatementConnection();
        var subBlock = workspace.newBlock('orion_custom_defaults_mutable_option');
        subBlock.initSvg();
        connection.connect(subBlock.previousConnection);
      }

      return topBlock;
  },
  /**
   * Save mutator dialog's content to original block.
   * @param {!Blockly.Block} topBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(topBlock) {
      this.customDefaults_ = (topBlock.getFirstStatementConnection().targetBlock() != null);
      if (this.type == 'orion_configure_output_mutable') {
        this.getField('BLOCK_ID').setValue(topBlock.getField('BLOCK_ID').getValue());
      }
      else {
        this.getField('BLOCK_ID').setValue(topBlock.getField('BLOCK_ID').getValue());
        this.getField('TYPE').setValue(topBlock.getField('TYPE').getValue());
        this.getField('PORT_ID').setValue(topBlock.getField('PORT_ID').getValue());
        this.getField('PIN_ID').setValue(topBlock.getField('PIN_ID').getValue());
      }
      this.updateShape_();  // update original block in underlying workspace
  },
  /**
   * Modify the original block to have (or not have) an input for 'Defaults to'.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var inputExists = this.getInput('CUSTOM_DEFAULTS');
    if (this.customDefaults_) {
      if (!inputExists) {
        this.appendValueInput('CUSTOM_DEFAULTS')
            .setCheck('Defaults')
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField('Defaults:');
      }
    } else if (inputExists) {
      this.removeInput('CUSTOM_DEFAULTS');
    }
  }
/*
  onchange: function(event) {
      if (event.type == Blockly.Events.BlockCreate) {

      }
      else if (event.type == Blockly.Events.DELETE) {

      }
  }
*/
};

/**
 * Helper function is run on the block after it is instantiated and the mixin object is added.
 * @this Blockly.Block
 * @package
 */
Blockly.Constants.oRIOn.OUTPUT_MUTATOR_EXTENSION = function() {
    var field = this.getField('BLOCK_ID');
    field.EDITABLE = false;

    var block_id = this.workspace.getBlocksByType('orion_configure_output_mutable').length;
    block_id += this.workspace.getBlocksByType('orion_configure_output_to_pin_mutable').length;

    field.setValue(blocks_id);  // for some reason, 1 additional block is placed, so no +1 here
}

Blockly.Extensions.registerMutator('orion_configure_output_mutator',
    Blockly.Constants.oRIOn.OUTPUT_MUTATOR_MIXIN,
    null,
    ['orion_custom_defaults_mutable_option']);

/**
 * Alternative option to above Blockly.Constants.oRIOn.OUTPUT_TO_PIN_MUTATOR_EXTENSION.
 * Called on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('orion_configure_output_extension',
    function() {
        var field = this.getField('BLOCK_ID');
        field.EDITABLE = false;

        if (this.workspace == demoWorkspace) {
            field.setValue(getNextFreeID(this.workspace, block_type.OUTPUT));
        }
        else {
            field.setValue(1);
        }
    }
);


//----------------//
// NUMERIC BLOCKS //
//----------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_constant",
  "message0": "%1",
  "args0": [
    {
      "type": "field_number",
      "name": "CONST",
      "value": 0
    }
  ],
  "output": "Float.1",
  "colour": 60,
  "tooltip": "Single float const",
  "helpUrl": ""
},
{
  "type": "orion_time_constant",
  "message0": "tau from %1",
  "args0": [
    {
      "type": "input_value",
      "name": "VALUE"
    }
  ],
  "inputsInline": true,
  "output": "Float.1",
  "colour": 195,
  "tooltip": "Time constant",
  "helpUrl": ""
},
{
  "type": "orion_defaults",
  "message0": "output %1 / %2",
  "args0": [
    {
      "type": "input_value",
      "name": "OUTPUT",
      "check": "Float.1"
    },
    {
      "type": "field_dropdown",
      "name": "ACTIVATED",
      "options": [
        [
          "enabled",
          "OPTION_YES"
        ],
        [
          "disabled",
          "OPTION_NO"
        ]
      ]
    }
  ],
  "inputsInline": true,
  "output": "Defaults",
  "colour": 195,
  "tooltip": "Block defaults",
  "helpUrl": ""
},
{
  "type": "orion_PID_parameters",
  "message0": "kp %1 / ki %2 / kd %3",
  "args0": [
    {
      "type": "input_value",
      "name": "KP",
      "check": "Float.1"
    },
    {
      "type": "input_value",
      "name": "KI",
      "check": "Float.1"
    },
    {
      "type": "input_value",
      "name": "KD",
      "check": "Float.1"
    }
  ],
  "inputsInline": true,
  "output": "Float.3",
  "colour": 195,
  "tooltip": "PID constants",
  "helpUrl": ""
},
{
  "type": "orion_range",
  "message0": "min %1 / max %2",
  "args0": [
    {
      "type": "input_value",
      "name": "MIN",
      "check": "Float.1"
    },
    {
      "type": "input_value",
      "name": "MAX",
      "check": "Float.1"
    }
  ],
  "inputsInline": true,
  "output": "Float.2",
  "colour": 195,
  "tooltip": "Range",
  "helpUrl": ""
}
]);



//--------------//
// LASSO BLOCKS //
//--------------//

Blockly.defineBlocksWithJsonArray([
{
  "type": "lasso_init",
  "lastDummyAlign0": "RIGHT",
  "message0": " Lasso host on target %1 %2 %3 Strobe: %4 %5 CRC generation: %6 %7 Callbacks: %8 %9 Callback generation: %10",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "TARGET",
      "options": [
        [
          "RXv2",
          "OPTION_RXv2"
        ],
        [
          "PSoc4",
          "OPTION_PSoC4"
        ],
        [
          "PSoc5",
          "OPTION_PSoC5"
        ],
        [
          "TivaTM4C",
          "OPTION_TivaTM4C"
        ],
        [
          "Mbed",
          "OPTION_Mbed"
        ]
      ]
    },
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS",
      "check": "lasso"
    },
    {
      "type": "field_dropdown",
      "name": "DYNASTROBE",
      "options": [
        [
          "static",
          "OPTION_OFF"
        ],
        [
          "dynamic",
          "OPTION_ON"
        ]
      ]
    },
    {
      "type": "input_dummy",
      "align": "RIGHT"
    },
    {
      "type": "field_dropdown",
      "name": "CRC",
      "options": [
        [
          "off",
          "OPTION_OFF"
        ],
        [
          "on",
          "OPTION_ON"
        ]
      ]
    },
    {
      "type": "input_dummy",
      "align": "RIGHT"
    },
    {
      "type": "field_dropdown",
      "name": "CALLBACKS",
      "options": [
        [
          "None",
          "OPTION_NONE"
        ],
        [
          "Strobe activation",
          "OPTION_STROBE_ACTIVATION"
        ],
        [
          "Period change",
          "OPTION_PERIOD_CHANGE"
        ],
        [
          "Both",
          "OPTION_BOTH"
        ]
      ]
    },    
    {
      "type": "input_dummy",
      "align": "RIGHT"
    },
    {
      "type": "field_dropdown",
      "name": "CALLBACK_ENABLE",
      "options": [
        [
          "hide",
          "OPTION_OFF"
        ],
        [
          "generate",
          "OPTION_ON"
        ]
      ]
    }
  ],
  "colour": 230,
  "tooltip": "lasso init",
  "helpUrl": "",
  "extensions": ["lasso_dynastrobe_extension"]
},
{
  "type": "lasso_register_datacell_mutable",
  "message0": "Register and %1: %2 datacell %3 as %4 x %5",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "ENABLED",
      "options": [
        [
          "include in strobe",
          "OPTION_YES"
        ],
        [
          "make permanent",
          "OPTION_PERMANENT"
        ],
        [
          "exclude from strobe",
          "OPTION_NO"
        ]
      ]
    },  
    {
      "type": "field_dropdown",
      "name": "ACCESS",
      "options": [
        [
          "read-only",
          "OPTION_READONLY"
        ],
        [
          "writeable",
          "OPTION_WRITEABLE"
        ]
      ]
    },
    {
      "type": "field_input",
      "name": "VARIABLE",
      "text": "myDatacell"
    },
    {
      "type": "field_number",
      "name": "NUMBER",
      "value": 1,
      "min": 1,
      "precision": 1
    },
    {
      "type": "field_dropdown",
      "name": "TYPE",
      "options": [
        [
          "bool",
          "LASSO_BOOL"
        ],
        [
          "char",
          "LASSO_CHAR"
        ],
        [
          "uint8",
          "LASSO_UINT8"
        ],
        [
          "int8",
          "LASSO_INT8"
        ],
        [
          "uint16",
          "LASSO_UIN16"
        ],
        [
          "int16",
          "LASSO_INT16"
        ],
        [
          "uint32",
          "LASSO_UINT32"
        ],
        [
          "int32",
          "LASSO_INT32"
        ],
        [
          "float",
          "LASSO_FLOAT"
        ]
      ]
    }
  ],
  "previousStatement": "lasso",
  "nextStatement": "lasso",
  "colour": 100,
  "tooltip": "lasso register datacell",
  "helpUrl": "",
  "mutator": "lasso_register_datacell_mutator",
},
{
  "type": "lasso_register_datacell_mutable_base",
  "message0": "Add custom datacell properties? %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS"
    }
  ],
  "previousStatement": "lasso",
  "nextStatement": "lasso",
  "colour": 100,
  "tooltip": "lasso register datacell",
  "helpUrl": ""
},
{
  "type": "lasso_register_orion_wire_mutable",
  "lastDummyAlign0": "RIGHT",
  "message0": "Register and %1: %2 oRIOn wire %3",
  "args0": [
    {
      "type": "field_dropdown",
      "name": "ENABLED",
      "options": [
        [
          "include in strobe",
          "OPTION_YES"
        ],
        [
          "make permanent",
          "OPTION_PERMANENT"
        ],
        [
          "exclude from strobe",
          "OPTION_NO"
        ]
      ]
    },  
    {
      "type": "field_dropdown",
      "name": "ACCESS",
      "options": [
        [
          "read-only",
          "OPTION_READONLY"
        ],
        [
          "writeable",
          "OPTION_WRITEABLE"
        ]
      ]
    },
    {
      "type": "input_value",
      "name": "WIRE_ID",
      "check": "Wire",
      "align": "RIGHT"
    }
  ], 
  "inputsInline": false,  
  "previousStatement": "lasso",
  "nextStatement": "lasso",
  "colour": 100,
  "tooltip": "lasso register oRIOn wire",
  "helpUrl": "",
  "mutator": "lasso_register_datacell_mutator",
},
{
  "type": "lasso_register_orion_wire_mutable_base",
  "message0": "Add custom datacell properties? %1 %2",
  "args0": [
    {
      "type": "input_dummy"
    },
    {
      "type": "input_statement",
      "name": "STATEMENTS"
    }
  ],
  "previousStatement": "lasso",
  "nextStatement": "lasso",
  "colour": 100,
  "tooltip": "lasso register oRIOn wire",
  "helpUrl": ""
},
]);


/**
 * Extension to set validator function for setting global var "dynastrobe".
 * Called once on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('lasso_dynastrobe_extension',
    function () {
        this.getField('DYNASTROBE').setValidator(function(option) {
            if (this.sourceBlock_.workspace) {
                dynastrobe = (option == 'OPTION_ON');
                //console.log(dynastrobe);
                
                // remove fields 'fieldID1' and 'fieldID2' from input 'CUSTOM_INPUT', if available
                if (dynastrobe === false) {
                    var connection = this.sourceBlock_.getFirstStatementConnection();
                    var target = null;
                    if (connection !== null) {
                        target = connection.targetBlock();
                    }
                    
                    while (target !== null) {
                        let input = target.getInput('CUSTOM_INPUT');
                        if ((input !== null) && (target.getField('FIELDID3') !== null)) {
                            input.removeField('FIELDID3');
                            input.removeField('FIELDID4');
                                
                            if (target.customProperty0_ == 'lasso_custom_period_mutable_option') {
                                target.customProperty0_ = null;
                            }
                            else
                            if (target.customProperty1_ == 'lasso_custom_period_mutable_option') {
                                target.customProperty1_ = null;
                            }
                            
                            //console.log('Found fields');
                        }
                        target = target.getNextBlock();
                    }
                    
                }
            }
        });
    }
);


/**
 * Mixin for mutator functions in the 'lasso_register_datacell_mutable' extension.
 * @mixin
 * @augments Blockly.Block
 * @package
 */
Blockly.Constants.lasso.REGISTER_DATACELL_MIXIN = {
  customProperty0_: null,  // must use value variables, not objects, for mixin to work!
  customProperty1_: null,
  customProperty2_: null,
  customProperty3_: null,
  customMaxProperties_: 4,  
  customCallback_: "onChange",
  customTickPeriod_: 1,    
  customCellName_: "myName",
  customCellUnit_: "myUnit",  
  /**
   * Create XML to represent whether extra features should be present.
   * Called when:
   * - toolbox flyout opens and block is constructed in flyout
   * - dragging block to workspace
   * - mutator toolbox opens
   * - dragging block to mutator workspace
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = null;
    
    // console.log('mutationToDom');
  
    let customProperties = [];
    let customPropertiesExist = false;
    for (let i = 0; i < this.customMaxProperties_; i++) {
        customProperties.push(this["customProperty" + String(i) + "_"]);
        if (customProperties[i] !== null) customPropertiesExist = true;
    }
    
    if (customPropertiesExist) {
        container = document.createElement('mutation');        
        for (let i = 0; i < this.customMaxProperties_; i++) {
            if (customProperties[i] !== null) container.setAttribute('customProperty' + String(i), customProperties[i]);
        }
    }
    
    return container;
  },
  /**
   * Parse XML to restore the extra features. Called when a <mutation> tag exists in block's XML.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
      
    // console.log('domToMutation');
      
    for (let i = 0; i < this.customMaxProperties_; i++) {
        this["customProperty" + String(i) + "_"] = xmlElement.getAttribute("customProperty" + String(i));
    }
    
    this.updateShape_();
  },
  /**
   * Populate mutator's workspace by decomposing original block (called once on opening mutator dialog).
   * @param {!Blockly.Workspace} workspace mutator's workspace.
   * @return {!Blockly.Block} root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {      
      var topBlock = workspace.newBlock(this.type + '_base');
      topBlock.initSvg();

      var customProperties = [];
      for (let i = 0; i < this.customMaxProperties_; i++) {
          customProperties.push(this["customProperty" + String(i) + "_"]);
      }
    
      var connection = topBlock.getFirstStatementConnection();
      var subBlock;

      // console.log('decompose');
      
      // connect subblock(s), if present
      for (let i = 0; i < this.customMaxProperties_; i++) {
          if (customProperties[i] !== null) {
            subBlock = workspace.newBlock(customProperties[i]);
            if (subBlock.disabled === true) {
                subBlock.dispose(false, true);
            }
            else {
                subBlock.initSvg();
                if (i == (this.customMaxProperties_ - 1)) {
                    subBlock.setNextStatement(false);
                }
                connection.connect(subBlock.previousConnection);
                connection = subBlock.nextConnection;
            }
          }
      }

      return topBlock;
  },
  /**
   * Save mutator dialog's content to original block. Called on change to mutator workspace:
   * - mutator toolbox opens
   * - dragging block to mutator workspace
   * @param {!Blockly.Block} topBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(topBlock) {
      var next_target = topBlock.getFirstStatementConnection().targetBlock();
      var target;
      var customProperties = [];
      for (let i = 0; i < this.customMaxProperties_; i++) {
          customProperties.push(null);
      }
      
      // console.log('compose');
      
      // save connected blocks in the right order and remove duplicates
      if (next_target !== null) {
          let i = 0;
          let j = 0;
          for (j = 0; j < this.customMaxProperties_; j++) {
              target = next_target;
              
              /* determine if target is a duplicate */
              let duplicate = false;
              for (let k = 0; k < j; k++) {
                  duplicate = (customProperties[k] == target.type);
                  if (duplicate) break;
              }
              next_target = target.getNextBlock();
              if (duplicate) {                  
                  //console.log('Disposing block no: ', j);
                  target.dispose(true, true);   /* heal, animate */
                  j--;
              }
              else {
                  customProperties[i++] = target.type;
              }
              
              if (next_target === null) { j++; break; }
          }
                  
          /* in case there is one block too many */
          if (next_target !== null) {
              target.nextConnection.disconnect();
              //console.log('Disposing final block');
              next_target.dispose(false, true); /* don't heal, animate */
          }
          
          if (j == this.customMaxProperties_) {              
              target.setNextStatement(false);
          }          
      }
      
      for (let i = 0; i < this.customMaxProperties_; i++) {
          this["customProperty" + String(i) + "_"] = customProperties[i];
      }      

      this.updateShape_();  // update original block in underlying workspace
  },
  /**
   * Modify the original block to have (or not have) additional features.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    // remove input before restoring it
    if (this.getInput('CUSTOM_INPUT')) {
        if (this.getField('FIELDID2')) {
            this.customCallback_ = this.getFieldValue('FIELDID2');
        }
        if (this.getField('FIELDID4')) {
            this.customTickPeriod_ = Number(this.getFieldValue('FIELDID4'));
        }    
        if (this.getField('FIELDID6')) {
            this.customCellName_ = this.getFieldValue('FIELDID6');
        }  
        if (this.getField('FIELDID8')) {
            this.customCellUnit_ = this.getFieldValue('FIELDID8');
        }          
        this.removeInput('CUSTOM_INPUT');
    }

    // reinstall inputs and reconnect
    var customProperties = [];
    for (let i = 0; i < this.customMaxProperties_; i++) {
      customProperties.push(this["customProperty" + String(i) + "_"]);
    }
    let customPropertiesExist = false;
    for (let i = 0; i < this.customMaxProperties_; i++) {
        if (customProperties[i] !== null) customPropertiesExist = true;
    }
    
    if (customPropertiesExist) {
        let input = this.appendDummyInput('CUSTOM_INPUT')
                        .setAlign(Blockly.ALIGN_RIGHT);
        for (let i = 0; i < this.customMaxProperties_; i++) {
            switch (customProperties[i]) {
                case 'lasso_custom_callback_mutable_option' : {
                    input.appendField('Callback:', 'FIELDID1')
                         .appendField(new Blockly.FieldTextInput(this.customCallback_), 'FIELDID2')
                    break;
                }
                case 'lasso_custom_period_mutable_option' : {
                    input.appendField('Period:', 'FIELDID3')
                         .appendField(new Blockly.FieldNumber(this.customTickPeriod_, 1, 'inf', 1), 'FIELDID4');
                    break;
                }
                case 'lasso_custom_cellname_mutable_option' : {
                    input.appendField('Name:', 'FIELDID5')
                         .appendField(new Blockly.FieldTextInput(this.customCellName_), 'FIELDID6');
                    break;
                }
                case 'lasso_custom_cellunit_mutable_option' : {
                    input.appendField('Unit:', 'FIELDID7')
                         .appendField(new Blockly.FieldTextInput(this.customCellUnit_), 'FIELDID8');
                    break;
                }
                default : {}
            }
        }
    }
  }
};

Blockly.Extensions.registerMutator('lasso_register_datacell_mutator',
    Blockly.Constants.lasso.REGISTER_DATACELL_MIXIN,
    null,
    ['lasso_custom_callback_mutable_option', 'lasso_custom_period_mutable_option', 'lasso_custom_cellname_mutable_option', 'lasso_custom_cellunit_mutable_option']);


//----------------//
// MUTATOR BLOCKS //
//----------------//


Blockly.defineBlocksWithJsonArray([
{
  "type": "orion_custom_defaults_mutable_option",
  "message0": "Custom defaults",
  "previousStatement": null,
  "colour": 195,
  "tooltip": "Custom defaults",
  "helpUrl": ""
},
{
  "type": "lasso_custom_callback_mutable_option",
  "message0": "Custom callback",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 195,
  "tooltip": "Custom callback",
  "helpUrl": ""
},
{
  "type": "lasso_custom_period_mutable_option",
  "message0": "Custom tick period",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 195,
  "tooltip": "Custom tick period",
  "helpUrl": "",
  "extensions": ["lasso_period_mutable_extension"]
},
{
  "type": "lasso_custom_cellname_mutable_option",
  "message0": "Custom datacell name",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 195,
  "tooltip": "Custom datacell name",
  "helpUrl": ""
},
{
  "type": "lasso_custom_cellunit_mutable_option",
  "message0": "Custom datacell unit",
  "previousStatement": null,
  "nextStatement": null,
  "colour": 195,
  "tooltip": "Custom datacell unit",
  "helpUrl": ""
}
]);


/**
 * Extension to disable block (in mutator toolbox) if "dynastrobe" is not true.
 * Called once on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('lasso_period_mutable_extension',
    function () {
        this.setDisabled(dynastrobe == false);
    }
);

/**
 * Extension to set validator function that checks the value of a new block ID.
 * Called once on block creation.
 * @this Blockly.Block
 */
Blockly.Extensions.register('orion_extension',
    function () {
        this.getField('BLOCK_ID').setValidator(function(option) {
            if (this.sourceBlock_.workspace) {
                var max_block_id = getNextFreeID(this.sourceBlock_.workspace, block_type_map.get(this.sourceBlock_.type));
                if (option > max_block_id) return max_block_id;
            }
        });
    }
);


Blockly.Constants.oRIOn.CLEAN_IDS_ON_DELETE = function(event) {
    // at this time, blocks have already been deleted from workspace
    var workspace = event.getEventWorkspace_();
    var id_map = [];

    for (let block_types of generateBlockTypes()) {

        // get all blocks with auto-assigned block_ids concerned by deletion
        var blocks = [];
        for (let t of block_types[0]) {
            blocks = blocks.concat(workspace.getBlocksByType(t));
        }

        // correct all auto-assigned block_ids concerned by deletion
        id_map = [];
        if (blocks) {

            // determine list of used output IDs
            var id_list = [];
            for (let b of blocks) {
                id_list.push(b.getField('BLOCK_ID').getValue());
            }
            id_list.sort(function(a, b){ return a - b; });  // sort numerically
            //alert('Remaining IDs: ' + id_list);

            // correct remaining IDs
            for (let b of blocks) {
                var reduce = 0;
                var max_id = b.getField('BLOCK_ID').getValue();
                var k = 0;
                while (id_list[k] < max_id) {
                    k++;
                }
                b.getField('BLOCK_ID').setValue(k + 1);
                id_map.push([max_id, k + 1]);
            }
        }

        // correct also all user-assigned block_ids
        for (let t of block_types[1]) {
            blocks = workspace.getBlocksByType(t);
            if  (blocks) {
                for (let b of blocks) {
                    var mapped = false;
                    for (let m of id_map) {
                        if (b.getField('BLOCK_ID').getValue() == m[0]) {
                            b.getField('BLOCK_ID').setValue(m[1]);
                            mapped = true;
                            break;
                        }
                    }
                    if (!mapped) {
                        b.getField('BLOCK_ID').setValue(0);
                    }
                }
            }
        }
    }
}