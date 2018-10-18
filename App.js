import React, {Fragment} from 'react';
import {AsyncStorage, StyleSheet, Text, View, ScrollView, TouchableOpacity, SafeAreaView, Modal} from 'react-native';
import {Contacts} from 'expo';

const FavoriteIdKey = '@MyStore:FavoriteId';

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            doneLoading: false,
            contacts: [],
            activeContact: {},
            modalVisible: false,
            favoriteId: '',
        };

        Contacts.getContactsAsync({
            fields: [Contacts.Fields.PhoneNumbers],
        }).then(({data}) => {
            this.setState({
                contacts: data,
                doneLoading: true,
            });
            this._retrieveFavoriteId();
        });
    }

    _storeFavoriteId = async () => {
        try {
            await AsyncStorage.setItem(FavoriteIdKey, this.state.favoriteId);
        } catch (error) {
            console.error(error);
        }
    };

    _retrieveFavoriteId = async () => {
        try {
            const favoriteId = await AsyncStorage.getItem(FavoriteIdKey);
            if (favoriteId !== null) {
                this.setState({
                    favoriteId,
                });
            }
        } catch (error) {
            console.error(error);
        }
    };

    renderContactRow = (contact) => {
        console.log('contact: ' + JSON.stringify(contact));

        return (
            <TouchableOpacity
                key={contact.id}
                style={styles.contactRow}
                onPress={() => this.setState({activeContact: contact, modalVisible: true})}
            >
                <Text style={styles.title}>{contact.name}</Text>
                {contact.phoneNumbers ? <Text style={styles.header}>{contact.phoneNumbers[0].number}</Text> : <Text>''</Text>}
                {this.state.favoriteId === contact.id && <Text style={styles.favoriteLabel}>Favorite</Text>}
            </TouchableOpacity>
        );
    };

    renderTopNav = () => {
        return (
            <SafeAreaView style={styles.topNav}>
                <View style={{flex: 1, flexDirection: 'row'}}>
                    <TouchableOpacity
                        style={styles.navButton}
                        onPress={() => this.setState({modalVisible: false})}>
                        <Text>{`< Back`}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, styles.favoriteButton]}
                        onPress={() => {
                            if (this.state.favoriteId === this.state.activeContact.id) {
                                this.setState({favoriteId: ''},
                                    () => this._storeFavoriteId());
                            } else {
                                this.setState({favoriteId: this.state.activeContact.id},
                                    () => this._storeFavoriteId());
                            }
                        }
                        }>
                        {this.state.favoriteId === this.state.activeContact.id
                            ? <Text style={styles.header}>- Unfavorite</Text>
                            : <Text>+ Favorite</Text>
                        }
                    </TouchableOpacity>
                </View>f
            </SafeAreaView>
        );
    };

    renderContactModal = (contacts) => {
        console.log("activeContact: " + Object.keys(contacts));
        let result = [];

        Object.keys(contacts).map((key) => {
            if (typeof contacts[key] === 'string') {
                result.push(
                    <Fragment key={key}>
                        <View style={styles.contactModal}>
                            <Text style={styles.header}>{key}</Text>
                            <Text style={styles.title}>{contacts[key]}</Text>
                        </View>
                    </Fragment>
                );
            } else {
                // Recursive step
                result.push(this.renderContactModal(contacts[key]));
            }
        });

        return result;
    };

    render() {
        return (
            <SafeAreaView style={styles.container}>
                {!this.state.doneLoading && (<View style={styles.loading}><Text style={styles.title}>Loading contacts...</Text></View>)}

                <ScrollView>
                    <View>
                        {this.state.doneLoading && this.state.contacts.map(contact => this.renderContactRow(contact))}
                    </View>
                </ScrollView>


                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.modalVisible}
                    onRequestClose={() => {
                        this.setState({
                            modalVisible: false,
                        });
                    }}>
                    <View style={styles.modalContainer}>
                        <ScrollView style={styles.scrollModal}>
                            {this.renderContactModal(this.state.activeContact)}
                        </ScrollView>
                        {this.renderTopNav()}
                    </View>
                </Modal>
            </SafeAreaView>
        );
    }
}

const NavbarHeight = 100;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loading: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
    },
    header: {
        fontWeight: 'bold',
    },
    topNav: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: NavbarHeight,
        borderBottomWidth: 1,
        borderColor: '#999',
        backgroundColor: '#AAA',
    },
    navButton: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    favoriteLabel: {
        color: '#F66',
        fontWeight: 'bold',
    },
    favoriteButton: {
        alignItems: 'flex-end',
    },
    scrollModal: {
        paddingTop: NavbarHeight,
    },
    modalContainer: {
        flex: 1,
        paddingLeft: 20,
    },
    contactModal: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#666'
    },
    contactRow: {
        flex: 1,
        padding: 20,
        margin: 10,
        borderWidth: 1,
        borderColor: '#AAA',
        borderRadius: 7,
    },
});
