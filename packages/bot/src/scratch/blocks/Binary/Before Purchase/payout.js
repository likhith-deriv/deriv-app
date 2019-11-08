import { translate } from '../../../../utils/lang/i18n';

Blockly.Blocks.payout = {
    init() {
        this.jsonInit(this.definition());
    },
    definition(){
        return {
            message0: translate('Payout %1'),
            args0   : [
                {
                    type   : 'field_dropdown',
                    name   : 'PURCHASE_LIST',
                    options: [['', '']],
                },
            ],
            output         : 'Number',
            outputShape    : Blockly.OUTPUT_SHAPE_ROUND,
            colour         : Blockly.Colours.Base.colour,
            colourSecondary: Blockly.Colours.Base.colourSecondary,
            colourTertiary : Blockly.Colours.Base.colourTertiary,
            tooltip        : translate('This block returns the potential payout for the selected trade type'),
            category       : Blockly.Categories.Before_Purchase,
        };
    },
    meta(){
        return {
            'display_name': translate('Potential payout'),
            'description' : translate('This block returns the potential payout for the selected trade type. This block can be used only in the "Purchase conditions" root block.'),
        };
    },
    onchange            : Blockly.Blocks.purchase.onchange,
    populatePurchaseList: Blockly.Blocks.purchase.populatePurchaseList,
    enforceLimitations  : Blockly.Blocks.purchase.enforceLimitations,
};

Blockly.JavaScript.payout = block => {
    const purchaseList = block.getFieldValue('PURCHASE_LIST');

    const code = `Bot.getPayout('${purchaseList}')`;
    return [code, Blockly.JavaScript.ORDER_ATOMIC];
};
