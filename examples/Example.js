import React from 'react';

import SelectMultiLevel from '../src/index';

class Example extends React.PureComponent {
  render() {
    const pages = [{
      title: "Page 1 Title",
      key: "unique_page_index_1",
      searchPlaceHolder: 'Page 1 search'
    }, {
      title: "Page 2 Title",
      key: "unique_page_index_2",
      searchPlaceHolder: 'Page 2 search',
      backButtonLabel: 'Back to page 1'
    }];

    const defaultValue = [
      { label: "Default label", value: "default value" }
    ];

    return (
      <div>
        <SelectMultiLevel 
          emptySearchLabel="Your search returned no results"
          emptyListLabel="No options"
          placeholder="Select ..."
          pages={pages}
          value={defaultValue}
          onPageRequestItems={(pageKey, triggerItem, onReady) => {
            if(pageKey=== "unique_page_index_1") {
              // Releated items
              onReady([
                { label: "page 1 label 1", value: "page 1 value 1" },
                { label: "page 1 label 2", value: "page 1 value 2" },
                { label: "page 1 label 3", value: "page 1 value 3" },
                { label: "page 1 label 4", value: "page 1 value 4" }
              ]);
            }
            if(pageKey=== "unique_page_index_2") {
              // triggerItem its {label, value} from previous page

              // Releated items
              onReady([
                { label: "page 2 label 1", value: "page 2 value 1" },
                { label: "page 2 label 2", value: "page 2 value 2" },
                { label: "page 2 label 3", value: "page 2 value 3" },
                { label: "page 2 label 4", value: "page 2 value 4" }
              ]);
            }
          }} />
      </div>
    );
  }
}

export default Example;
