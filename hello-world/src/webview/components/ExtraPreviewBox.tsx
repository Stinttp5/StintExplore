import React from 'react';
import { CanvasComponent } from './ParameterBox';
// import {stintRandomDegree,stintRandomIOStorage,stintRandomMinMax} from "../libraries/p5.preview"
// import {sampleCanvasFromStorage,stintRandomMinMax} from "../libraries/p5.explore"

interface ExtraPreviewBoxProps {
  idName: string;
  preview: any;
}

function ExtraPreviewBox({idName, preview}: ExtraPreviewBoxProps) {
  return <div style={{ marginBottom: 30 }}> {/* sorry isabel don't hate me pls :)) */}
    <div>
      <strong>
        {idName}
      </strong>
    </div>
    <div>
      <CanvasComponent randomID={idName} preview={preview}/>
    </div>
  </div>;
};

export default ExtraPreviewBox;