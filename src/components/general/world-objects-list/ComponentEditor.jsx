
import classNames from 'classnames';
import React, { useContext, useEffect, useState } from 'react';

import { AppContext } from '../../app';

import styles from './component-editor.module.css';

//

export const ComponentEditor = () => {

    const { selectedApp } = useContext( AppContext );
    const [ components, setComponents ] = useState( [] );
    const [ editComponentKey, setEditComponentKey ] = useState( null );
    const [ editComponentKeyNewValue, setEditComponentKeyNewValue ] = useState( null );

    //

    const initComponentsList = () => {

        const newComponents = [];

        selectedApp.components.forEach( ( component ) => {

            let type = 'json';

            if ( typeof component.value === 'string' ) type = 'string';
            if ( typeof component.value === 'number' ) type = 'number';
            if ( typeof component.value === 'boolean' ) type = 'bool';

            newComponents.push({ key: component.key, value: ( type === 'json' ? JSON.stringify( component.value ) : component.value.toString() ), type: component.type ?? type, error: false });

        });

        setComponents( newComponents );

    };

    const updateState = () => {

        setComponents( [ ...components ] );

    };

    const validateValues = () => {

        for ( let i = 0; i < selectedApp.components.length; i ++ ) {

            const value = components[ i ].value;
            components[ i ].error = false;

            if ( components[ i ].type === 'number' ) {

                if ( value.match(/^-?\d+$/) || value.match(/^\d+\.\d+$/) ) {

                    selectedApp.components[ i ].value = parseFloat( value );

                } else {

                    components[ i ].error = true;

                }

            } else if ( components[ i ].type === 'bool' ) {

                if ( value === 'true' ) {

                    selectedApp.components[ i ].value = true;

                } else if ( value === 'false' ) {

                    selectedApp.components[ i ].value = false;

                } else {

                    components[ i ].error = true;

                }

            } else if ( components[ i ].type === 'json' ) {

                try {

                    selectedApp.components[ i ].value = JSON.parse( value );

                } catch ( err ) {

                    components[ i ].error = true;

                }

            } else {

                selectedApp.components[ i ].value = value.toString();

            }


        }

    };

    //

    const handleAddNewBtnClick = () => {

        selectedApp.components.push({ key: 'New item', value: '', type: 'string' });
        components.push({ key: 'New item', value: '', type: 'string', error: false });

    };

    const handleRemoveItemBtnClick = ( key ) => {

        const newList = [];

        for ( let i = 0; i < selectedApp.components.length; i ++ ) {

            if ( selectedApp.components[ i ].key === key ) continue;
            newList.push( selectedApp.components[ i ] );

        }

        selectedApp.components = newList;
        initComponentsList();

    };

    const handleEditItemBtnClick = ( key ) => {

        setEditComponentKey( key );
        setEditComponentKeyNewValue( key );

    };

    const handleValueInputChange = ( key, event ) => {

        const value = event.target.value;

        for ( let i = 0; i < selectedApp.components.length; i ++ ) {

            if ( selectedApp.components[ i ].key !== key ) continue;
            components[ i ].value = value;
            break;

        }

        validateValues();
        updateState();

    };

    const handleKeyInputKeyUp = ( key, event ) => {

        if ( event.key === 'Enter' ) {

            event.preventDefault();
            event.stopPropagation();
            handleApplyItemKeyBtnClick( key );
            event.target.blur();

        }

    };

    const handleKeyInputChange = ( event ) => {

        setEditComponentKeyNewValue( event.target.value );

    };

    const handleTypeSelectChange = ( key, event ) => {

        for ( let i = 0; i < selectedApp.components.length; i ++ ) {

            if ( key !== selectedApp.components[ i ].key ) continue;
            components[ i ].type = event.target.value;
            break;

        }

        validateValues();
        updateState();

    };

    const handleApplyItemKeyBtnClick = () => {

        for ( let i = 0; i < selectedApp.components.length; i ++ ) {

            if ( editComponentKey === selectedApp.components[ i ].key ) {

                selectedApp.components[ i ].key = editComponentKeyNewValue;
                components[ i ].key = editComponentKeyNewValue;
                break;

            }

        }

        setEditComponentKey( null );
        updateState();

    };

    //

    useEffect( () => {

        initComponentsList();

    }, [ selectedApp ] );

    //

    return (
        <div className={ styles.componentsEditor }>
            <div className={ styles.title }>Components ({ selectedApp.components.length })</div>
            {
                components.map( component => {

                    const isEditable = ( component.key !== 'instanceId' && component.key !== 'contentId' );

                    return (
                        <div className={ classNames( styles.item, ( ! isEditable ? styles.disabled : null ) ) } key={ component.key } >
                            <img src="./images/ui/lock.svg" className={ styles.lock } />
                            <div className={ styles.itemRemove } onClick={ isEditable ? handleRemoveItemBtnClick.bind( this, component.key ) : null } >x</div>
                            {
                                editComponentKey === component.key ? (
                                    <>
                                        <img src="./images/ui/check.svg" className={ styles.itemApply } onClick={ handleApplyItemKeyBtnClick.bind( this, component.key ) } />
                                        <input className={ styles.itemKey } value={ editComponentKeyNewValue } onChange={ handleKeyInputChange } type="text" onKeyUp={ handleKeyInputKeyUp.bind( this, component.key ) } />
                                    </>
                                ) : (
                                    <>
                                        <img src="./images/ui/edit.svg" className={ styles.itemEdit } onClick={ handleEditItemBtnClick.bind( this, component.key ) } />
                                        <div className={ styles.itemTitle } >{ component.key }</div>
                                    </>
                                )
                            }
                            <input className={ classNames( styles.itemValue, ( isEditable && component.error ? styles.valueError : null ) ) } disabled={ ! isEditable } type="text" value={ component.value } onChange={ handleValueInputChange.bind( this, component.key ) } />
                            {
                                isEditable ? (
                                    <select className={ styles.itemType } value={ component.type } onChange={ handleTypeSelectChange.bind( this, component.key ) } >
                                        <option value='string' >string</option>
                                        <option value='number' >number</option>
                                        <option value='bool' >bool</option>
                                        <option value='json' >json</option>
                                    </select>
                                ) : null
                            }
                            <div className={ styles.clearfix } />
                        </div>
                    );

                })
            }
            <div className={ styles.addNewItem } onClick={ handleAddNewBtnClick } >Add new</div>
        </div>
    );

};