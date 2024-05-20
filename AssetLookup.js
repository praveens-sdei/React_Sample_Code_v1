/*
 * --------------------------------------
 * Copyright (c) 
 * --------------------------------------
 */
import React, { PureComponent, Fragment } from 'react';
import { Card, CardBody, Col, InputGroup, InputGroupAddon, Input, Button  } from 'reactstrap';
import PlacesAutocomplete from 'react-places-autocomplete';
import classNames from 'classnames';
import { connect } from 'react-redux';
import { lookupAsset, saveAsset, saveAssetNotFoundLog } from '../../../actions/asset/assetAction';
import LookupResult from './LookupResult';



class AssetLookup extends PureComponent {

  constructor(props) {
    super(props);
    this.state = { 
      address: '',
      foundAssets:[],
      hasSearched:false, 
    };
  }

  handleChange = address => {
    this.setState({ address });
  };

  searchAsset = (e) => {
    e.preventDefault();
    
    const {address} = this.state;
    if (address) {
      this.setState({hasSearched: false, loading: true, foundAssets: []});
      this.props.lookupAsset(address);
    }
  }

  importAsset = (asset) => {
    this.props.saveAsset(asset);
  }

  componentWillReceiveProps(nextProps) {
    if(this.props !== nextProps){
      const { asset } = nextProps;
      if(asset.lookupAssetSuccess === true){
        this.setState({foundAssets: asset.lookupAssets, hasSearched:true, loading: false});
        if(asset.lookupAssets.length === 0) {
          this.props.saveAssetNotFoundLog(this.state.address);
        }
      }
    }
  }

  render() {
    const { foundAssets, hasSearched, loading } = this.state;
    return (
      <Col  md={{ size: 8, offset: 2 }} lg={{ size: 8, offset: 2 }}>
        <Card>
          <CardBody>
            <div className="card__title">
              <h5 className="bold-text">Asset Lookup</h5>
              <h5 className="subhead">Rets.ly © Rets.ly, Inc., 2006-2019. Use is subject to terms of use.</h5>
            </div>
            <form className="form" onSubmit={this.searchAsset}>
                <PlacesAutocomplete
                  value={this.state.address}
                  onChange={this.handleChange}
                  searchOptions={{componentRestrictions: {country: 'us'}}}>
                  {({ getInputProps, suggestions, getSuggestionItemProps }) => (
                    <div className="form__form-group">
                      <div className="form__form-group-field">
                        <InputGroup>
                          <Input {...getInputProps({
                            placeholder: 'Asset Address',
                            className: 'autocomplete__input',
                          })}/>
                          <InputGroupAddon addonType="append">
                             <Button color="primary" type="submit" className="autocomplete__search-button"
                              onClick={this.searchAsset} disabled={loading}>{loading?'Please wait':'Lookup'}</Button> 
                          </InputGroupAddon>
                        </InputGroup>
                      </div>

                      {suggestions.length > 0 && (
                        <div className="autocomplete-suggestion-container ">
                          {suggestions.map(suggestion => {
                            const className = classNames('autocomplete__suggestion-item', {
                              'autocomplete__suggestion-item--active': suggestion.active,
                            });

                            return (
                              /* eslint-disable react/jsx-key */
                              <div
                                {...getSuggestionItemProps(suggestion, { className })}
                              >
                                <strong>
                                  {suggestion.formattedSuggestion.mainText}
                                </strong>{' '}
                                <small>
                                  {suggestion.formattedSuggestion.secondaryText}
                                </small>
                              </div>
                            );
                            /* eslint-enable react/jsx-key */
                          })}
                          <div className="autocomplete__dropdown-footer">
                            <div>
                              <img
                                src={require('../../../images/powered_by_google_default.png')}
                                className="autocomplete__dropdown-footer-image"
                                alt="powered by Google"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                  )}
                </PlacesAutocomplete>
            </form>
            {hasSearched &&
            <Fragment>
            <h4 className="subhead">Found {foundAssets.length} properties</h4>
            <div>
              {foundAssets.map((r, i) => (
                <LookupResult key={i} asset={r} importAsset={this.importAsset}/>
              ))}
            </div>
            </Fragment>
            }
          </CardBody>
        </Card>
      </Col>
    );
  }
}

const mapStateToProps = state => ({
  asset: state.asset
});

const mapDispatchToProps = dispatch => ({
    lookupAsset: (address) => lookupAsset(address, dispatch),
    saveAsset: (asset) => saveAsset(asset, dispatch),
    saveAssetNotFoundLog : (address) => saveAssetNotFoundLog(address, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(AssetLookup);

