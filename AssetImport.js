/*
 * --------------------------------------
 * Copyright (c) 
 * --------------------------------------
 */

import React, {PureComponent} from "react";
import PropTypes from "prop-types";
import {Formik, Field} from "formik";
import * as Yup from "yup";
import {saveAsset} from "../../../actions/asset/assetAction";
import {withRouter} from "react-router";

import FormField from "../../../shared/components/form/FormField";
import customSelect from "../../../shared/components/form/customSelect";

import {Modal} from "reactstrap";
import {connect} from "react-redux";

class AssetImport extends PureComponent {
  static propTypes = {
    data: PropTypes.object.isRequired,
    modalOpen: PropTypes.bool
  };

  constructor(props) {
    super(props);
    this.state = {
      importFailed: false,
      loading: false
    };
  }

  handleSubmit = (values, {props = this.props}) => {
    values.areaSquareFeet |= 0;
    values.lotSizeSquareFeet |= 0;
    props.saveAsset(values);
    this.setState({loading: true});
  };

  closeModal = () => {
    this.props.toggleModal();
    this.props.toggleMainModal();
  };

  componentWillReceiveProps = nextProps => {
    const {asset} = nextProps;
    if (
      this.state.loading &&
      asset.isSavingAssetSuccess === true &&
      asset.slug
    ) {
      this.setState({loading: false}, () => {
        this.closeModal();

        nextProps.history.push(`/dashboard/assets/${asset.slug}/worksheet`);
      });
    } else if (asset.isSavingAssetSuccess === false) {
      this.setState({importFailed: true, loading: false});
    }
  };

  render() {
    const {data} = this.props;
    let initialValues = data;
    initialValues.user_role = "O";
    initialValues.owner_email = "";
    initialValues.tenant_email = "";
    initialValues.assetType = "primary";

    const validationSchema = Yup.object({
      user_role: Yup.string("").required("Asset Role is required"),
      owner_email: Yup.string().when("user_role", {
        is: role => role === "O",
        then: Yup.string().email("Invalid Email"),
        otherwise: Yup.string()
          .email("Invalid Email")
          .required("Owner email is required")
          .max(100, "Email too long")
      }),
      assetType: Yup.string("").required("Asset Type is required")
    });

    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={this.handleSubmit}
        render={props => {
          const {handleSubmit, values} = props;
          const {modalOpen} = this.props;
          return (
            <Modal
              isOpen={modalOpen}
              className={"modal-dialog modal-dialog-centered"}
              contentClassName={"newexpensemodal"}
            >
              <div className="modal-header  border-0 mb-0 mb-sm-3">
                <h5 className="modal-title">{"Import Asset"}</h5>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group row">
                    <label htmlFor="type" className="col-sm-2 col-form-label">
                      Type:
                    </label>
                    <div className="col-sm-10 inputblock">
                      <Field
                        name="assetType"
                        component={customSelect}
                        placeholder="Asset Type"
                        options={[
                          {value: "primary", label: "Primary Residence"},
                          {value: "rental", label: "Rental"},
                          {value: "note", label: "Note"},
                          {value: "syndicate", label: "Syndicate"},
                          {value: "flip", label: "Flip"}
                        ]}
                      />
                    </div>
                  </div>
                  <div className="form-group row">
                    <label htmlFor="role" className="col-sm-2 col-form-label">
                      Role:
                    </label>
                    <div className="col-sm-10 inputblock">
                      <Field
                        name="user_role"
                        component={customSelect}
                        placeholder="Asset Role"
                        options={[
                          {value: "O", label: "Owner"},
                          {value: "I", label: "Investor"},
                          {value: "T", label: "Tenant"},
                          {value: "IA", label: "Insurance Agent"},
                          {value: "R", label: "Real Estate Agent"},
                          {value: "C", label: "Certified Public Accountant"},
                          {value: "B", label: "Banker"},
                          {value: "U", label: "Other"}
                        ]}
                      />
                    </div>
                  </div>

                  {values.user_role !== "O" && (
                    <div className="form-group row">
                      <label
                        htmlFor="staticEmail"
                        className="col-sm-2 col-form-label"
                      >
                        Owner's Email:
                      </label>
                      <div className="col-sm-10 inputblock">
                        <Field
                          name="owner_email"
                          component={FormField}
                          type="email"
                          placeholder="example@example.com"
                        />
                      </div>
                    </div>
                  )}
                  {values.assetType === "rental" && values.user_role === "O" && (
                    <div className="form-group row">
                      <label
                        htmlFor="staticEmail"
                        className="col-sm-2 col-form-label"
                      >
                        Tenant's Email:
                      </label>
                      <div className="col-sm-10 inputblock">
                        <Field
                          name="tenant_email"
                          component={FormField}
                          type="email"
                          placeholder="example@example.com"
                        />
                      </div>
                    </div>
                  )}
                  <div className=" pb-5 pt-3 border-0 text-center">
                    <button
                      type="reset"
                      className="btn cencelbtn px-5 d-inline-block mx-2"
                      onClick={this.closeModal}
                      disabled={this.state.loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn savebtns px-5  d-inline-block mx-2"
                      disabled={this.state.loading}
                    >
                      Save{" "}
                    </button>
                  </div>
                </form>
              </div>
            </Modal>
          );
        }}
      />
    );
  }
}

const mapStateToProps = state => ({
  asset: state.asset
});

const mapDispatchToProps = dispatch => ({
  saveAsset: asset => saveAsset(asset, dispatch)
});
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AssetImport)
);

