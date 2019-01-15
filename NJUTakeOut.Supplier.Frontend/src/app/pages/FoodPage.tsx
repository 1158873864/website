import React from "react";
import { Page, Button, ButtonArea,Panel,PanelHeader,PanelBody,Cell } from 'react-weui';
//import styles
import 'weui';
import 'react-weui/build/packages/react-weui.css';

export class FoodPage extends React.Component<{}, {}>{
  render(){
    return (<Page className="panel" title="Panel" subTitle="面板">
      <Panel>
        <PanelHeader>
          菜品图片
        </PanelHeader>
        <PanelBody>
          <Cell>
              <img src="" />
              <ButtonArea>
                  <Button type="default">点击以添加图片</Button>
              </ButtonArea>
          </Cell>
        </PanelBody>
      </Panel>
    </Page>);
  }
}