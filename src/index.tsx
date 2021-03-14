import React from 'react';
import { render } from 'react-dom';
import App from './App';
import './App.global.css';
import createWindowControlListeners from './util/titlebar';

createWindowControlListeners();
render(<App />, document.getElementById('root'));
