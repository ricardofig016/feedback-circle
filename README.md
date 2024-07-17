# Install lightweight server:
    npm install live-server -g

# Run lightweight server:
    live-server.cmd .




# How to create a new component (e.g., MyComponent):
1. Create a new folder 'my-component' under 'components', with two files inside: 'my-component.component.html' and 'my-component.component.js'.
2. The 'my-component.component.js' file should follow this template:

```js
    'use strict';

    import BaseComponent from '../base/base.component.js';

    export default class MyComponentComponent extends BaseComponent {
        selector = 'my-component'; // matching the folder and HTML/JS file names

        onInit() {
            super.onInit();
        }
    }
```

3. Add the routing path to Routes in 'routes/routes.js' in the form 'URLForMyComponent: MyComponentComponent'.