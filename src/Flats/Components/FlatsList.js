import React, { useState, useEffect } from "react";
import { connect } from 'react-redux';
import AsyncSelect from 'react-select/async';
import { deleteFlat, loadFlatListAsync } from '../Actions/flatsActions';
import { Button, Alert, Form, Row, Col, Table, Modal } from 'react-bootstrap';
import Pagination from '../../AppComponents/Pagination';
import "../Layout/FlatsLayout.css";
import { DEBUGGING, BACKEND_URL, FLATS_URL } from '../../AppConstants/AppConstants';
import { fetchGet } from '../../AppComponents/ServerApiService';

const mapStateToProps = (state) => ({ 
  flats: state.flats.flats,
  loading: state.flats.loading,
  idDeleting: state.flats.idDeleting,
  error: state.flats.error,

  //For Pagination
  pageNumber: state.flats.pageable.pageNumber,
  totalPages: state.flats.totalPages,
  pageSize: state.flats.pageable.pageSize,
  totalElements: state.flats.totalElements
});

const mapDispatchToProps = (dispatch) => ({
  loadFlatListAsync: (URL) => dispatch(loadFlatListAsync(URL)),
  deleteFlat: (flatId) => dispatch(deleteFlat(flatId)),
})

function FlatsList(props) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [MGLower, setMGLower] = useState("");
  const [MGUpper, setMGUpper] = useState("");
  const [priceLower, setPriceLower] = useState("");
  const [priceUpper, setPriceUpper] = useState("");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pagingOptions, setPagingOptions] = useState({
    name: "",
    city: "",
    country: "",
    MGLower: "",
    MGUpper: "",
    priceLower: "",
    priceUpper: "",
  });

  useEffect(() => {console.log(getOptionsStr(props.pageNumber)); props.loadFlatListAsync(`${FLATS_URL}${getOptionsStr(props.pageNumber)}`)}, []);
  
  const handleCloseConfirmation = () => setShowConfirmation(false);
  const handleShowConfirmation = () => setShowConfirmation(true);
  const onDeleteFlat = (flatId) => {
    props.deleteFlat(flatId);
    setShowConfirmation(false);
  }

  const getOptionsStr = (pageNumber) =>
  {
    let opt_str = `?size=${props.pageSize}&page=${pageNumber}`;
    if (name !== "") opt_str += `&name=${name}`;
    if (country !== "") opt_str += `&country=${country}`;
    if (city !== "") opt_str += `&city=${city}`;
    if (MGLower !== "") opt_str += `&guestsFrom=${MGLower}`;
    if (MGUpper !== "") opt_str += `&guestsTo=${MGUpper}`;
    if (priceLower !== "") opt_str += `&priceFrom=${priceLower}`;
    if (priceUpper !== "") opt_str += `&priceTo=${priceUpper}`;
    return opt_str;
  }

  const clearOptions = () => 
  {
    setName("");
    setCountry("");
    setCity("");
    setMGLower("");
    setMGUpper("");
    setPriceLower("");
    setPriceUpper("");
  }

  const renderTableData = () => {
    return props.flats.map((flat, index) => (
        <tr key={index} className='FlatsRow'>
          <td>{flat.name}</td>
          <td>{flat.address.country}</td>
          <td>{flat.address.city}</td>
          <td>{flat.maxGuests}</td>
          <td>{flat.price}</td>
          <td disabled={props.idDeleting !== -1}>      
            <Button className='GreenButton' type="button" 
              href={`/flats/details/${flat.id}`}>Detail
            </Button>
            <Button className='BlueButton' type="button" 
              href={`/flats/edit/${flat.id}`}>Edit
            </Button>
            <Button className='RedButton' type="button" 
              onClick={handleShowConfirmation}>Delete
            </Button>
          </td>
          <Modal
              show={showConfirmation}
              onHide={handleCloseConfirmation}
              backdrop="static"
              keyboard={false}
            >
              <Modal.Header closeButton>
                <Modal.Title>Confirmation</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Are you sure to delete flat {flat.name}?
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseConfirmation}>
                  Close
                </Button>
                <Button variant="primary" onClick={() => onDeleteFlat(flat.id)}>Delete</Button>
              </Modal.Footer>
            </Modal>
        </tr>
      )
    )
  }

  return (
    <div className="FlatsList">
    {
      props.loading ? <Alert variant='primary'>Loading...</Alert> : 
        (props.error ? <Alert variant='danger'>Fetch error...</Alert> :
        <ul>
          {props.flats && props.flats.length > 0 ? 
          <div>
            <Form className='FlatsForm'>
              <Row>
                <Col>
                  <Form.Label>Search by Flat's name</Form.Label>
                  <Form.Control className="BasicInputField" placeholder="Flat's name" type="text" onChange={(e) => setName(e.target.value)}/>
                </Col>
                <Col>
                  <Form.Label>Country</Form.Label>
                  <AsyncSelect className="single-select" classNamePrefix="select" 
                        isDisabled={city !== ""} isClearable={true} isRtl={false} isSearchable={true}
                        name="countrySelect"
                        placeholder="Select Country..."
                        defaultOptions
                        loadOptions = {(inputValue, callback) => {
                          setTimeout(() => {
                            fetchGet(`${BACKEND_URL}metadata/countries`)
                              .then(promise => {return promise.status === 404 ? [] : promise.json()})
                              .then(json => 
                                {
                                  let filtered = json.filter(i => i.toLowerCase().includes(inputValue.toLowerCase()));
                                  callback(filtered.map((i) => {return {value: i, label: i}}));
                                }
                              );
                          }, 1000)
                        }}
                        onChange={(opt) => { opt != null ? setCountry(opt.value) : setCountry("")}}
                      />
                </Col>
                <Col>
                  <Form.Label>City</Form.Label>
                  <AsyncSelect className="single-select" classNamePrefix="select" 
                    isDisabled={false} isClearable={true} isRtl={false} isSearchable={true}
                    name="citySelect"
                    placeholder="Select City..."
                    defaultOptions
                    loadOptions = {(inputValue, callback) => {
                      setTimeout(() => {
                        fetchGet(`${BACKEND_URL}metadata/cities${country !== "" ? `?country=${country}` : ""}`)
                          .then(promise => {return promise.status === 404 ? [] : promise.json()})
                          .then(json => 
                            {
                              let filtered = json.filter(i => i.toLowerCase().includes(inputValue.toLowerCase()));
                              callback(filtered.map((i) => {return {value: i, label: i}}));
                            }
                          );
                      }, 1000)
                    }}
                    onChange={(opt) => { opt != null ? setCity(opt.value) : setCity("")}}
                  />
                </Col>
                <Col>
                  <Form.Label>Max guests</Form.Label>
                  <Form.Control className="BasicInputField" placeholder="Min" type="number" min={1} onChange={(e) => setMGLower(e.target.value)}/>
                  <Form.Control className="BasicInputField" placeholder="Max" type="number" min={1} onChange={(e) => setMGUpper(e.target.value)}/>
                </Col>
                <Col>
                  <Form.Label>Price</Form.Label>
                  <Form.Control className="BasicInputField" placeholder="Min" type="number" min={1} onChange={(e) => setPriceLower(e.target.value)}/>
                  <Form.Control className="BasicInputField" placeholder="Max" type="number" min={1} onChange={(e) => setPriceUpper(e.target.value)}/>
                </Col>
                <Col>
                  <Button variant='light' type="button" className='ButtonAddFlat'
                    hidden={props.loading || props.saving}
                    disabled={props.idDeleting !== -1}
                    href={`/flats/add`}
                    size="lg">
                      Add new flat
                  </Button>
                </Col>
              </Row>
              <Row >
                <Col />
                <Col />
                <Col>
                <Button onClick={(e) => {
                  e.preventDefault();
                  setPagingOptions({
                    name: name,
                    city: city,
                    country: country,
                    MGLower: MGLower,
                    MGUpper: MGUpper,
                    priceLower: priceLower,
                    priceUpper: priceUpper,
                  });
                  props.loadFlatListAsync(`${FLATS_URL}${getOptionsStr(props.pageNumber)}`);
                  clearOptions();
                }}>
                  Apply Filters
                </Button>
                </Col>
                <Col />
                <Col />
              </Row>
              <Row>
                <Table className='FlatsTable'>
                  <thead>
                    <tr>
                      <th>Flat name</th>
                      <th>Country</th>
                      <th>City</th>
                      <th>Max guests</th>
                      <th>Price</th>
                      <th>Options</th>
                    </tr>
                  </thead>
                  <tbody>{renderTableData()}</tbody>
                </Table>
              </Row>
            </Form>
            <div className="d-flex flex-row py-4 align-items-center">
              <Pagination 
                pageNumber = {props.pageNumber}
                totalPages = {props.totalPages}
                pageSize = {props.pageSize}
                totalElements = {props.totalElements}
                onChangingPage = {(pageNumber) => {
                  clearOptions();
                  let { name, country, city, MGLower, MGUpper, priceLower, priceUpper } = pagingOptions;
                  let opt_str = `?size=${props.pageSize}&page=${pageNumber}`;
                  if (name !== "") opt_str += `&name=${name}`;
                  if (country !== "") opt_str += `&country=${country}`;
                  if (city !== "") opt_str += `&city=${city}`;
                  if (MGLower !== "") opt_str += `&guestsFrom=${MGLower}`;
                  if (MGUpper !== "") opt_str += `&guestsTo=${MGUpper}`;
                  if (priceLower !== "") opt_str += `&priceFrom=${priceLower}`;
                  if (priceUpper !== "") opt_str += `&priceTo=${priceUpper}`;
                  props.loadFlatListAsync(`${FLATS_URL}${opt_str}`);
                }}/>
            </div>
          </div>
          : <div></div>}
        </ul>
      )
    }
    </div>
  );
}
export default connect(mapStateToProps, mapDispatchToProps)(FlatsList);