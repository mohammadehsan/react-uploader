import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {create} from 'jss';
import rtl from 'jss-rtl';
import JssProvider from 'react-jss/lib/JssProvider';
import {MuiThemeProvider, jssPreset, createMuiTheme} from '@material-ui/core/styles';
import * as serviceWorker from './serviceWorker';
import Uploader from "./components/Uploader";
import translations from './translations'
import {IntlProvider, IntlReducer as Intl} from 'react-redux-multilingual'
import {Provider} from 'react-redux';
import {combineReducers, createStore} from "redux";

const jss = create({plugins: [...jssPreset().plugins, rtl()]});
const defaultLocale = 'fa';
const multiLanguageReducer = combineReducers(Object.assign({}, { Intl }));
const store= createStore(multiLanguageReducer, { Intl: { locale: defaultLocale }});

export const theme = createMuiTheme({
    direction: 'rtl',
    typography: {
        fontFamily: [
            'tahoma',
            'sans-serif'
        ].join(','),
        useNextVariants: true,
    },
});

class IndexUploader extends Component {
    render() {
        return (
            <Provider store={store}>
                <IntlProvider translations={translations}>
                    <MuiThemeProvider theme={theme}>
                        <JssProvider jss={jss}>
                            <Uploader uploadUrl="your upload url"/>
                        </JssProvider>
                    </MuiThemeProvider>
                </IntlProvider>
            </Provider>
        );
    }
}

ReactDOM.render(<IndexUploader/>, document.getElementById('root'));

serviceWorker.unregister();
