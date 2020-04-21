import React, { PureComponent } from 'react';
import Tag from '@atlaskit/tag';
import TagGroup from '@atlaskit/tag-group';
import styles from './SelectMultiLevel.module.css';
import HipchatChevronDownIcon from '@atlaskit/icon/glyph/hipchat/chevron-down';
import DropList from '@atlaskit/droplist';
import Textfield from '@atlaskit/textfield';
import Spinner from '@atlaskit/spinner';
import ArrowLeftIcon from '@atlaskit/icon/glyph/arrow-left';
import OutsideClickDetector from './OutsideClickDetector';

class SelectMultiLevel extends PureComponent {
  state = {    
    filter: '',
    selected: this.props.value || [],
    pageIndex: 0,
    isLoading: true,
    isListShowed: false,
    triggerItem: null,
    items: []
  }

  onRemoveHandler = (value) => {
    this.setState({
      selected: this.state.selected.filter(v => v.value != value)
    }, () => {
      // Notify parent component (if listening)
      if(typeof this.props.onChange === "function") {
        this.props.onChange(this.state.selected);
      }
    });
    return true;
  }

  getKey = (tag) => {
    return tag.label.toLowerCase().replace(/\s/g, '_') + tag.value
  }

  getTagJSX = (tag) => {
    return (
      <div key={this.getKey(tag)} className={styles.TagWrapper}>
        <Tag 
          focusable="true"
          text={tag.label} 
          removeButtonText="Remove" 
          onAfterRemoveAction={this.onRemoveHandler.bind(this, tag.value)} />
      </div>
    );
  }

  getTagsJSX = () => {
    return (
      <TagGroup>
        { this.state.selected.map(tag => this.getTagJSX(tag)) }
      </TagGroup>
    )
  }

  getEmptyPreviewJSX = () => {
    return (
      <div>
        { this.props.placeholder || 'Select items'}
      </div>
    );
  }

  onBackPressedHandler = () => {
    const prevPageIndex = this.state.pageIndex - 1;
    this.setCurrentPageIndex(Math.max(prevPageIndex, 0));
  }

  addItemToState = (item) => {
    // Copy original select list
    const newSelected = [... this.state.selected];
    // Check conflicts
    if(newSelected.filter(s => s.value === item.value).length === 0) {
      newSelected.push(item);

      // Update select list
      this.setState({
        selected: newSelected
      }, () => {
        // Notify parent component (if listening)
        if(typeof this.props.onChange === "function") {
          this.props.onChange(this.state.selected);
        }
      });
    }
  }

  setCurrentPageIndex = (pageIndex, item) => {
    // Set new page index, show loader
    this.setState({
      pageIndex: pageIndex,
      isLoading: true,
      items: [],
      triggerItem: item
    }, this.requestCurrentPageRender);
  }

  onItemClickHandler = (item) => {
    // Check if this page is last
    if(this.state.pageIndex === this.props.pages.length - 1) {
      this.addItemToState(item);
    } else {
      const nextPageIndex = this.state.pageIndex + 1;
      this.setCurrentPageIndex(nextPageIndex, item);
    }
  }

  componentDidMount() {
    // Request new items
    this.requestCurrentPageRender();
  }

  requestCurrentPageRender = () => {
    // Check if callback exist
    if(typeof this.props.onPageRequestItems === 'function') {
      // Get current page
      const currentPage = this.props.pages[this.state.pageIndex];
      // Request new items
      this.props.onPageRequestItems(currentPage.key, this.state.triggerItem, (result) => {
        this.setState({
          isLoading: false,
          items: result
        });
      });
    }
  }

  onFilterTextChangedHandler = (event) => {
    this.setState({
      filter: event.target.value
    });
  }

  getFilteredItems = (items) => {
    const { filter, selected } = this.state;
    const searchText = filter.toLowerCase();
    const existedValues = selected.map(s => s.value);
    const handleTextFilter = itemText => {
      if(searchText.length === 0 || itemText.length === 0) {
        return true;
      }
      return itemText.toLowerCase().indexOf(searchText) !== -1;
    };
    return items.filter(item => {
      return existedValues.indexOf(item.value) === -1 && handleTextFilter(item.label);
    });
  }

  getEmptyListJSX = (message) => {
    return (
      <div className={styles.EmptyViewContainer}>
        <div className={styles.EmptyViewText}>{message}</div>
      </div>
    )
  }

  hideListHandler = () => {
    if(this.state.isListShowed) {
      this.setState({
        isListShowed: false
      });
    }
  }

  toggleListHandler = () => {
    this.setState({
      isListShowed: !this.state.isListShowed
    });
  }

  getItemsRenderJSX = () => {
    const { isLoading, items } = this.state;
    const {
      emptySearchLabel = 'Your search returned no results', 
      emptyListLabel = 'No options'
    } = this.props;

    if(isLoading) {
      return (
        <div className={styles.Loader}>
           <Spinner size="large" />
        </div>
      );
    }

    const filteredItems = this.getFilteredItems(items);
    if(filteredItems.length) {
      return (
        <React.Fragment>
          { filteredItems.map(item => (
            <div className={styles.Item}
              key={this.getKey(item)} 
              onClick={this.onItemClickHandler.bind(this, item)}>
              { item.label }
            </div>
          )) }
        </React.Fragment>
      );
    } else {
      return items.length > 0 ? 
        this.getEmptyListJSX(emptySearchLabel): 
        this.getEmptyListJSX(emptyListLabel);
    }
  }

  render() {
    const {
       pages
    } = this.props;
    
    const currentPage = pages[this.state.pageIndex];

    return (
      <OutsideClickDetector className={styles.Container} onOutside={this.hideListHandler}>
        <div className={styles.Preview}>
          <div className={styles.TriggerArea} onClick={this.toggleListHandler}></div>
          {
            this.state.selected.length ?
              this.getTagsJSX() :
              this.getEmptyPreviewJSX()
          }
          <div className={styles.DownIcon}>
            <HipchatChevronDownIcon primaryColor="#42526E" />
          </div>
        </div>
        <div className={styles.ListContainer}>
          {
            pages ? 
              <DropList boundariesElement="viewport" isOpen={this.state.isListShowed} shouldFitContainer={true}>
                <div> 
                  { this.state.pageIndex !== 0 && !this.state.isLoading ? (
                    <div className={styles.BackButton} onClick={this.onBackPressedHandler}>
                      <ArrowLeftIcon />  
                      <div className={styles.BackButtonLabel}>
                        {currentPage.backButtonLabel || 'Back'}
                      </div>
                    </div>
                  ) : null }
                  <div className={styles.SearchContainer}>
                    <Textfield name="auto-focus" 
                        autoComplete="off"
                        value={this.state.filter} 
                        autoFocus 
                        placeholder={currentPage.searchPlaceHolder || 'Type to search'}
                        onChange={this.onFilterTextChangedHandler}/>
                  </div>
                </div>
                <div className={styles.ItemsContainer}>
                  {currentPage.title ? (
                  <div className={styles.PageTitle}>
                    {currentPage.title}
                  </div>
                  ) : null}
                  <div className={styles.ItemsList}>
                    { this.getItemsRenderJSX() }
                  </div>
                </div>
              </DropList>
             : 
            null
          }
        </div>
      </OutsideClickDetector>
    )
  }
}

export default SelectMultiLevel;