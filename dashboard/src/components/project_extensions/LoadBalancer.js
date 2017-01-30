import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Form, FormGroup, Input } from 'reactstrap'
import { Field, FieldArray, reduxForm } from 'redux-form'
import _ from 'underscore'
import ButtonConfirmAction from '../../components/ButtonConfirmAction'

const renderInput = field => {
  return (
    <Input {...field.input} type={field.type} placeholder={field.placeholder} />
  )
}

const renderSelect = field => {
  return (
    <select {...field.input} name={field.name} className="form-control">
      <option disabled value="">Choose service</option>
      {field.services.map(function (service) {
        return <option key={service._id} value={service._id}>{service.name}</option>
      })}
    </select>
  )
}

const renderDomainSelect = field => {
  return (
    <select {...field.input} name={field.name} className="form-control">
      <option disabled value="">Choose domain</option>
      <option key="test.checkrhq.net" value="test.checkrhq.net">test.checkrhq.net</option>
    </select>
  )
}

const renderProtocolSelect = field => {
  return (
    <select {...field.input} name={field.name} className="form-control">
      <option disabled value="">Choose protocol</option>
      <option key="http" value="HTTP">HTTP</option>
      <option key="https" value="HTTPS">HTTPS</option>
      <option key="ssl" value="SSL">SSL</option>
      <option key="tcp" value="TCP">TCP</option>
      <option key="udp" value="UDP">UDP</option>
    </select>
  )
}

const renderListenerSelect = field => {
  if (_.isEmpty(field.service.listeners)) {
    return null
  }
  return (
    <select {...field.input} name={field.name} className="form-control">
      <option disabled value="" key="">Choose service listener</option>
      {field.service.listeners.map(function (listener) {
        return <option key={listener.port} value={listener.port}>{listener.port}</option>
      })}
    </select>
  )
}

const normalizeInt = (value, _previousValue) => {
  return parseInt(value, 10)
}

const renderListeners = ({ fields, service }) => {
  return (
  <div className="col-xs-12">
    { !_.isEmpty(service) && <hr />}
    { (fields.length > 0) &&
    <div className="row">
      <div className="col-xs-4">
        <label>Port</label>
      </div>
      <div className="col-xs-4">
        <label>Service Port</label>
      </div>
      <div className="col-xs-3">
        <label>Service Protocol</label>
      </div>
      <div className="col-xs-1" />
    </div>
    }
    {fields.map((s, i) =>
    <div className="row" key={i}>
      <div className="col-xs-4">
        <div className="form-group">
          <Field name={'listenerPairs['+i+'].source.port'} component={renderInput} type="number" step="1" min="0" max="65535" normalize={normalizeInt}/>
        </div>
      </div>
      <div className="col-xs-4">
        <div className="form-group">
          <Field className="form-control" name={'listenerPairs['+i+'].destination.port'} service={service} component={renderListenerSelect} normalize={normalizeInt}/>
        </div>
      </div>
      <div className="col-xs-3">
        <Field className="form-control" name={'listenerPairs['+i+'].destination.protocol'} component={renderProtocolSelect}/>
      </div>
      <div className="col-xs-1">
        <button type="button" className="btn btn-secondary btn-sm float-xs-right btn-service-action-right" onClick={() => fields.remove(i)}>
          <i className="fa fa-times" aria-hidden="true" />
        </button>
      </div>
    </div>
    )}
    {!_.isEmpty(service) && <div className="row">
      <div className="col-xs-2">
        <button type="button" className="btn btn-secondary btn-sm float-xs-left btn-service-action" onClick={() => fields.push({destination: {protocol: "HTTPS"}})}>Add port map</button>
      </div>
    </div>}
  </div>
  )
}

const renderDomains = ({ fields, service, formValues }) => {
  return (
  <div className="col-xs-12">
    { !_.isEmpty(formValues.values.listenerPairs) && <hr /> }
    { (fields.length > 0) &&
    <div className="row">
      <div className="col-xs-11">
        <label>Domains</label>
      </div>
      <div className="col-xs-1" />
    </div>
    }
    {fields.map((s, i) =>
    <div className="row" key={i}>
      <div className="col-xs-11">
        <div className="form-group">
          <Field className="form-control" name={'domains['+i+']'} service={service} component={renderDomainSelect}/>
        </div>
      </div>
      <div className="col-xs-1">
        <button type="button" className="btn btn-secondary btn-sm float-xs-right btn-service-action-right" onClick={() => fields.remove(i)}>
          <i className="fa fa-times" aria-hidden="true" />
        </button>
      </div>
    </div>
    )}
    {!_.isEmpty(formValues.values.listenerPairs) && <div className="row">
      <div className="col-xs-12">
        <button type="button" className="btn btn-secondary btn-sm float-xs-left btn-service-action" onClick={() => fields.push({destination: {protocol: "HTTPS"}})}>Link domain</button>
      </div>
    </div>}
  </div>
  )
}

class LoadBalancer extends Component {
  renderShow() {
    let { services, extension } = this.props
    let service = {}
    if (!_.isEmpty(extension) && extension.serviceId) {
      service = _.findWhere(services, { _id: extension.serviceId })
    }

    let dns = <div className="input-group lb-exp"><div className="input-group-addon"><i className="fa fa-globe" aria-hidden="true" /></div><input type="text" className="form-control" value={extension.type} readOnly/></div>
    if (!_.isEmpty(extension.dnsName)) {
      dns = <div className="input-group lb-exp"><div className="input-group-addon"><i className="fa fa-globe" aria-hidden="true" /></div><input type="text" className="form-control" value={extension.dnsName} readOnly/></div>
    }

    return (
      <div>
        <h5 className="lb-title">
          Load Balancer
        </h5>
        { !_.isEmpty(service) && <div className="input-group lb-exp"><div className="input-group-addon"><i className="fa fa-tasks" aria-hidden="true" /></div><input type="text" className="form-control" value={service.name} readOnly/></div>
 }

        {dns}
      </div>
    )
  }

  renderEdit() {
    const { onSave, onCancel, onDelete, formValues } = this.props
    let { services } = this.props
    let service = {}

    if (!_.isEmpty(formValues) && formValues.values.serviceId) {
      service = _.findWhere(services, { _id: formValues.values.serviceId })
    }
    return (
      <Form>
        <FormGroup>
          <div className="row">
            <div className="col-xs-12">
              <div className="row">
                <div className="col-xs-4">
                  <div className="form-group">
                    <label>Service</label>
                    <Field className="form-control" name="serviceId" services={services} component={renderSelect}/>
                  </div>
                </div>
                <div className="col-xs-8">
                  <div className="form-group">
                    <label>Access</label>
                    <div className="form-group service-protocol">
                      <label className="form-check-inline">
                        <Field className="form-check-input" name="type" component={renderInput} type="radio" value="internal"/> Internal
                      </label>
                      <label className="form-check-inline">
                        <Field className="form-check-input" name="type" component={renderInput} type="radio" value="office"/> Office
                      </label>
                      <label className="form-check-inline">
                        <Field className="form-check-input" name="type" component={renderInput} type="radio" value="external"/> External
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row">
                <FieldArray name="listenerPairs" props={{ service: service }} component={renderListeners}/>
              </div>
              <div className="row">
                <FieldArray name="domains" props={{ service: service, formValues: formValues }} component={renderDomains}/>
              </div>
            </div>
            <div className="col-xs-12">
              <button type="button" className="btn btn-secondary btn-sm float-xs-right btn-service-action-right" onClick={() => onCancel()}>
                <i className="fa fa-times" aria-hidden="true" /> Cancel
              </button>
              <ButtonConfirmAction btnLabel="Delete" btnIconClass="fa fa-check" onConfirm={onDelete} btnClass="btn btn-danger btn-sm float-xs-right btn-service-action-right">
                Are you sure?
              </ButtonConfirmAction>
              <ButtonConfirmAction btnLabel="Save" btnIconClass="fa fa-check" onConfirm={onSave} btnClass="btn btn-success btn-sm float-xs-right btn-service-action-right">
                Are you sure?
              </ButtonConfirmAction>
            </div>
          </div>
        </FormGroup>
      </Form>
    )
  }

  render() {
    if (this.props.edit) {
      return this.renderEdit()
    } else {
      return this.renderShow()
    }
  }
}

const LoadBalancerForm = reduxForm({
  enableReinitialize: true,
  destroyOnUnmount: false,
  form: 'projectExtension'
})(LoadBalancer)

export default connect(
  state => {
    const formValues = state.form.projectExtension
    return { formValues: formValues }
  }
)(LoadBalancerForm)
