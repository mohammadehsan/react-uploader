import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
    Table, TableBody, TableCell, TableHead, TablePagination,
    CircularProgress, TableRow, IconButton, Button,
    LinearProgress, Badge, withStyles, Tooltip
} from '@material-ui/core';
import Icon from "@mdi/react";
import {mdiFileExcel, mdiFilePdf, mdiFileWord} from "@mdi/js";
import {Check, CloudUpload, CloudUploadOutlined, Delete} from '@material-ui/icons';
import Dropzone from "react-dropzone";
import {styles} from '../style';
import axios from "axios";
import { withTranslate } from 'react-redux-multilingual';

const StyledTableCell = withStyles(theme => ({
    head: {
        backgroundColor: theme.palette.background.default,
        color: "#c7c7c7",
    },
    body: {
        fontSize: 11,
    },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
    root: {
        '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.background.default,
        },
    },
}))(TableRow);


class Uploader extends Component {
    constructor(props) {
        super(props);
        this.state = {
            files: [],
            completedIndexes: [],
            completed: 0,
            total: 0,
            page: 0,
            rowsPerPage: 5,
            processIndex: null,
            done: false
        }
    }

    handleChangePage = (event, newPage) => {
        this.setState({page: newPage});
    };

    handleChangeRowsPerPage = event => {
        this.setState({rowsPerPage: +event.target.value});
    };

    onDrop = async files => {
        let totalSize = 0;
        files.map((file) => {
            totalSize += file.size;
        });
        await this.setState({files: files, total: totalSize});
        if (this.props.autoUpload) {
            this.uploaderHandler(null);
        }
        if (this.props.returnItems !== undefined) {
            return this.props.returnItems(this.state.files);
        }
    };

    uploaderHandler = async (index) => {
        this.setState({processIndex: index});
        var bodyFormData = new FormData();
        if (index === null) {
            this.state.files.map((file) => {
                bodyFormData.append('files', file);
            });
        } else {
            bodyFormData.append('files', this.state.files[index]);
        }
        await axios.post(this.props.uploadUrl, bodyFormData, {
            onUploadProgress: (progressEvent) => {
                var percentCompleted = Math.round((progressEvent.loaded * 100) / this.state.totalSize);
                this.setState({completed: percentCompleted});

            },
        }).then(respons => {
            var cmpList = this.state.completedIndexes;
            if (this.state.files === 1) {
                if (!cmpList.find(item => item.name === respons.data[0])) {
                    cmpList.push({name: respons.data[0], code: respons.data[1]});
                }
            } else {
                respons.data.map((ary) => {
                    if (!cmpList.find(item => item.name === ary[0])) {
                        cmpList.push({name: ary[0], code: ary[1]});
                    }
                });
            }
            alert(this.props.translate('uploadingSuccessful'));
            this.setState({done: true, completedIndexes: cmpList});
            return this.props.responseStatus(true);
        }).catch(errors => {
            alert(this.props.translate('errorInUpload'));
            return this.props.responseStatus(false);
        });
    };


    removeAll = () => {
        this.setState({
            files: [], completed: 0, completedIndexes: [],
            total: 0, page: 0, rowsPerPage: 5, processIndex: null, done: false
        });
        alert(this.props.translate('deleteAllRecords'));
    };

    removeItem = (name) => {
        let array, indx, cmpList;
        array = this.state.files;
        indx = array.findIndex(item => item.name === name);
        if (indx !== -1) {
            array.splice(indx, 1);
        }

        cmpList = this.state.completedIndexes;
        indx = cmpList.findIndex(item => item.name === name);
        if (indx !== -1) {
            cmpList.splice(indx, 1)
        }
        /*
            if (indx!==-1) so that your file uploaded, you can
            call server side method in this section
            to remove file from server repository
         */
        this.setState({files: array, completedIndexes: cmpList});
        alert(this.props.translate('deleteSelectedRecord'));
    };

    render() {
        const {classes, minSize, maxSize, multiple, autoUpload, hideButtons,translate} = this.props;
        const {page, rowsPerPage, files, completed, processIndex, completedIndexes} = this.state;
        const styleDropzone = {
            dragActive: {margin: 12, borderRadius: 4, backgroundColor: "#f2fafd", border: "1px solid #00a5ff"},
            dragDeactive: {margin: 12, borderRadius: 4, border: "1px dashed #9c9c9c"}
        };

        return (
            <div>
                <Dropzone onDrop={files => {
                    this.onDrop(files)
                }} minSize={minSize} maxSize={maxSize} multiple={multiple}>
                    {({getRootProps, getInputProps, isDragActive}) => {
                        return (
                            <div className="container">
                                <div {...getRootProps({className: 'dropzone'})}
                                     style={isDragActive ? styleDropzone.dragActive : styleDropzone.dragDeactive}>
                                    <input {...getInputProps()} />
                                    {
                                        isDragActive ?
                                            <p style={{textAlign: 'center', fontSize: 11, color: '#9c9c9c'}}>
                                                {translate('dropFilePlease')}</p> :
                                            <p style={{textAlign: 'center', fontSize: 11, color: '#9c9c9c'}}>
                                                <span>{translate('clickToSelectFile')}</span>
                                                <CloudUpload style={{marginTop: 6, fontSize: 24}}/></p>
                                    }
                                </div>

                            </div>
                        );
                    }}
                </Dropzone>
                <aside style={{padding: 12}}>
                    {processIndex === null ? <LinearProgress variant="determinate" value={completed}/> : null}
                    <Table>
                        <TableHead>
                            <TableRow>
                                <StyledTableCell align="center">{translate('row')}</StyledTableCell>
                                <StyledTableCell align="center">{translate('profile')}</StyledTableCell>
                                <StyledTableCell align="center">{translate('fileName')}</StyledTableCell>
                                <StyledTableCell align="center">{translate('fileSize')}</StyledTableCell>
                                <StyledTableCell align="center"> </StyledTableCell>
                                <StyledTableCell align="center">{translate('action')}</StyledTableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {files.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((file, index) => (
                                <StyledTableRow key={index}>
                                    <StyledTableCell align="center">
                                        {index + 1}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">
                                        {file.type.includes("image") ?
                                            <img width="36" height="36"
                                                 src={URL.createObjectURL(file)}/> :
                                            (file.type.includes("application/pdf") ?
                                                <Icon size={1} path={mdiFilePdf} color={"#ee453e"}/> :
                                                (file.type.includes(".document") ?
                                                    <Icon size={1} path={mdiFileWord} color={"#009ce6"}/> :
                                                    (file.type.includes(".sheet") ?
                                                        <Icon size={1} path={mdiFileExcel}
                                                              color={"#7fd41b"}/> : file.type)))}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">{file.path}</StyledTableCell>
                                    <StyledTableCell
                                        align="center">{Math.round(file.size / 1024).toFixed(0)}{translate('kb')}</StyledTableCell>

                                    <StyledTableCell align="center">
                                        {processIndex === index ?
                                            <CircularProgress color="primary" variant="determinate"
                                                              value={completed}/> : null}
                                    </StyledTableCell>
                                    <StyledTableCell align="center">

                                        <IconButton onClick={() => {
                                            this.removeItem(file.name)
                                        }}>
                                            <Tooltip title={translate('deleteItem')} placement="top">
                                                <Delete className={classes.textError}/>
                                            </Tooltip>
                                        </IconButton>
                                        {(autoUpload || hideButtons) ? completedIndexes.find(item => item.name === file.name) ?
                                            <Check className={classes.textSuccess}/> : null :
                                            (completedIndexes.find(item => item.name === file.name) ?
                                                <Check className={classes.textSuccess}/>
                                                : <IconButton onClick={() => {
                                                    this.uploaderHandler(index);
                                                }}>
                                                    <Tooltip title={translate('uploadItem')} placement="top">
                                                        <CloudUploadOutlined className={classes.textInfo}/>
                                                    </Tooltip>
                                                </IconButton>)}
                                    </StyledTableCell>
                                </StyledTableRow>

                            ))}
                        </TableBody>
                    </Table>
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={files.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        backIconButtonProps={{
                            'aria-label':translate('lastPage'),
                        }}
                        nextIconButtonProps={{
                            'aria-label':translate('nextPage'),
                        }}
                        labelRowsPerPage={translate('recordInPage')}
                        labelDisplayedRows={paginationInfo => {
                            return translate('paginationInfo',{to:paginationInfo.to,
                                    from:paginationInfo.from,
                                count:paginationInfo.count})

                        }}
                        onChangePage={this.handleChangePage}
                        onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    />

                    <div className={classes.formButtonSection}>
                        {(autoUpload || hideButtons) ? null :
                            <Badge color="primary" badgeContent={files.length - completedIndexes.length}
                                   className={classes.margin}>
                                <Button disabled={(files.length === completedIndexes.length) ? true : false}
                                        color="primary" onClick={() => {
                                    this.uploaderHandler(null)
                                }} variant="outlined" size="medium"
                                        style={{padding: "5px 8px", margin: 0}}><CloudUploadOutlined
                                    style={{margin: '0 4px'}}/>{translate('uploadAll')}</Button>
                            </Badge>}
                        <Badge color="primary" badgeContent={this.state.files.length}
                               className={classes.margin}>
                            <Button disabled={(files.length === 0) ? true : false}
                                    className={classes.errorButtonOutLine} onClick={this.removeAll}
                                    variant="outlined"
                                    size="medium"><Delete style={{margin: '0 4px'}}/>{translate('deleteAll')}</Button>
                        </Badge>
                    </div>

                </aside>
            </div>
        );
    }

}
Uploader.contextTypes = {
    translate: PropTypes.func
};

Uploader.propTypes = {
    classes: PropTypes.object.isRequired,
    multiple: PropTypes.bool,
    minSize: PropTypes.number,
    maxSize: PropTypes.number,
    autoUpload: PropTypes.bool,
    hideButtons: PropTypes.bool,
    returnItems: PropTypes.func,
    responseStatus: PropTypes.func,
    uploadUrl: PropTypes.string.isRequired
};

export default withTranslate(withStyles(styles)(Uploader));
