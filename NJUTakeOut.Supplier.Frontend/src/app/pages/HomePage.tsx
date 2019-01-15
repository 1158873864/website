import React from "react";
import { Page, Button, ButtonArea } from 'react-weui';
//import styles
import 'weui';
import 'react-weui/build/packages/react-weui.css';

export class HomePage extends React.Component<{}, {}>{
  render(){
    return (<Page className="button" title="Button" subTitle="按钮" spacing>
      <ButtonArea>
        <Button type="primary">开始营业</Button>
        <Button type="warn">打烊</Button>
      </ButtonArea>
    </Page>);
  }
}