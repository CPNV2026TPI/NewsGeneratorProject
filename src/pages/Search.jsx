//
//  Author: Fabian Rostello
//  Date: 03.04.2026
//  File: Search.jsx
//  Description: 
//

import {forwardRef, useEffect, useRef, useState} from "react";
import {
    Button,
    Container,
    Content,
    CustomProvider,
    VStack,
    Form, Checkbox, CheckboxGroup, toaster, Message, ButtonToolbar, SelectPicker, Card, Loader,
    Tag, Text, HStack, TagGroup, Modal
} from "rsuite";
import {useNavigate} from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import {SchemaModel, StringType, ArrayType} from 'rsuite/Schema';
import TextPressure from '../features/news-feed/components/text-pressure/TextPressure.jsx';
import TextType from '../features/news-feed/components/text-type/TextType.jsx';
import {FeedList} from "../features/news-feed/components/feed-list/FeedList.jsx";
import {NewsApi} from "../features/news-feed/api/newsApi.js";
import {CustomSearchApi} from "@/features/search-history/api/customSearchApi.js";

// rsuite SelectPicker data
const languageOptions = [
    {value: 'en', label: 'English'},
    {value: 'fr', label: 'French'},
    {value: 'es', label: 'Spanish'},
    {value: 'ch', label: 'Chinese'},
    {value: 'ru', label: 'Russian'},
];

const timeframeOptions = [
    {value: 'h', label: 'Last Hour'},
    {value: 'd', label: 'Last 24 Hours'},
    {value: 'w', label: 'Last 7 Days'},
    {value: 'm', label: 'Last 30 Days'},
    {value: 'a', label: 'All Time'}
];

const Field = forwardRef((props, ref) => {
    const {name, message, label, accepter, error, ...rest} = props;
    return (
        <Form.Group controlId={`${name}-10`} ref={ref} className={error ? 'has-error' : ''}>
            <Form.Label>{label} </Form.Label>
            <Form.Control name={name} accepter={accepter} errorMessage={error} {...rest} />
            <Form.Text>{message}</Form.Text>
        </Form.Group>
    );
});

const model = SchemaModel({
    keyword: StringType()
        .isRequired('At least 1 keyword required.'),
    category: ArrayType()
        .minLength(1, 'Please select at least 1 category.')
        .isRequired('At least 1 category required.'),
    language: StringType()
        .minLength(1, 'Please select a language.')
        .isRequired('A language required.'),
    timeframe: ArrayType()
        .minLength(1, 'Please select a timeframe.')
        .isRequired('A timeframe required.')
});

export const SearchPage = () => {
    const navigate = useNavigate();
    const [newsList, setNewsList] = useState([])
    const [customSearchItems, setCustomSearchItems] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const hasSearched = useRef(false);
    const [token, setToken] = useState(localStorage.getItem("JWT"))
    const [user, setUser] = useState(token ? jwtDecode(token) : null)
    // form
    const formRef = useRef();
    const [formError, setFormError] = useState({});
    const [formValue, setFormValue] = useState({
        id: null,
        title: '',
        keyword: '',
        category: [],
        language: ''
    });
    // modal
    const [saveSearchModal, setSaveSearchModal] = useState(false);
    const handleOpen = () => setSaveSearchModal(true);
    const handleClose = () => setSaveSearchModal(false);

    const handleSubmit = async () => {
        // check if registered
        if (!user) {
            toaster.push(<Message type="error">Please log in to fetch news</Message>);
            navigate("/login");
            return;
        }

        // check form
        if (!formRef.current.check()) {
            toaster.push(<Message type="error">Missing fields</Message>);
            return;
        }

        setIsLoading(true);
        hasSearched.current = true;

        // Get all links from category
        const allNews = await SearchApi.getNews({
            category: formValue.category,
            keywords: [formValue.keyword]
        }, token);

console.log('App: allNews: ');
console.log(allNews);

        // print error message
        if (allNews && allNews.error && allNews.error.includes('Forbidden, invalid or expired')) {
            toaster.push(<Message type="error">Token is invalid or has expired, please log in</Message>);
            removeAuthCredentials()
        } else if (allNews && allNews.error) {
            toaster.push(<Message type="error">An error has occurred.. Please try again.</Message>);
        }

        setNewsList(allNews.news);
        setIsLoading(false);
    };

    const handleLogout = () => {
        if (token) {
            removeAuthCredentials()
            // navigate('/login')
        }
    }

    const handleSelectPicker = (item) => {
        setFormValue({
            title:item.title,
            id: item.id,
            keyword: item.keyword,
            category: item.category,
            language: item.language
        })
    }

    const removeAuthCredentials = () => {
        localStorage.removeItem("JWT");
        setToken(null);
        setUser(null);
    }

    useEffect(() => {
        const getUserCustomSearches = async () => {
            if (user) {
                try {
                    const data = await CustomSearchApi.getUserCustomSearch({id: user.id}, token);
                    if (data.error && data.error.name.includes("PrismaClientValidationError")) {
                        console.log("Error with Prisma database")
                        return;
                    }

                    const selectPickerData = data.map(item => ({
                        label: item.title,
                        value: item
                    }));

                    setCustomSearchItems(selectPickerData);
                } catch (e) {
                    console.error("Failed to fetch searches", e);
                }
            }
        }

        getUserCustomSearches()
    }, [user, token]);

    return (
        <CustomProvider theme="light">
            <CustomNavbar user={user} removeAuthCredentials={removeAuthCredentials}/>
            <Container className="app-header">
                <Content width={'75vw'} marginTop={50}>
                    <VStack width={'100%'} alignItems={'center'} gap={20}>
                        <VStack width={'100%'} marginBottom={50}>
                            <TextPressure
                                text="News Generator"
                                flex
                                alpha={false}
                                stroke={true}
                                width={true}
                                weight={true}
                                italic={true}
                                textColor="#F2E3D5"
                                strokeColor="#BFA584"
                                minFontSize={36}
                            />
                            <TextType
                                text={["It is a personalizable news generator.", "It must be able to read the news, understand it, and summarize the news it has read, taking into account user parameters such as keywords, desired/undesired topics, language and timeframe of the search."]}
                                className="text-xl font-sans-serif italic"
                                typingSpeed={40}
                                pauseDuration={1500}
                                showCursor
                                cursorCharacter="|"
                                deletingSpeed={15}
                                variableSpeedEnabled={false}
                                variableSpeedMin={60}
                                variableSpeedMax={120}
                                cursorBlinkDuration={0.4}
                            />
                        </VStack>
                        <Card padding={20} width={'75vw'} shaded>
                            <Text fontWeight={'600'} marginBottom={5}>Saved custom searches</Text>
                            <SelectPicker
                                marginBottom={10}
                                width={'100%'}
                                data={customSearchItems}
                                placeholder={"Use a custom search..."}
                                onSelect={(value) => {
                                    handleSelectPicker(value)
                                }}
                            />
                            <TagGroup marginBottom={15}>
                                {customSearchItems.map((item, index) => (
                                    <Tag key={index} color="orange" closable onClose={() => removeTag(item)}>
                                        {item.label}
                                    </Tag>
                                ))}
                            </TagGroup>
                            <Form fluid
                                  width={'100%'}
                                  ref={formRef}
                                  onChange={setFormValue}
                                  onCheck={setFormError}
                                  formValue={formValue}
                                  model={model}
                            >
                                <Form.Stack width={'100%'}>
                                    <Form.Group controlId="keyword">
                                        <Form.Label fontWeight={'600'}>Keywords</Form.Label>
                                        <Form.Control checkAsync name="keyword" id="keyword"
                                                      placeholder="e.g., artificial intelligence, climate change, innovations"/>
                                        <Form.HelpText>
                                            Enter keywords separated by commas
                                        </Form.HelpText>
                                    </Form.Group>
                                    <Form.Group controlId="undesiredTopic">
                                        <Form.Label fontWeight={'600'}>Undesired Topics</Form.Label>
                                        <Form.Control disabled={true} checkAsync name="undesiredTopic"
                                                      id="undesiredTopic"
                                                      placeholder="e.g., celebrity gossip, sports scores"/>
                                        <Form.HelpText>
                                            Enter undesired topics separated by commas
                                        </Form.HelpText>
                                    </Form.Group>
                                    <Form.Stack direction={'row'} width={'100%'} fontWeight={'600'}>
                                        <Field
                                            name="language"
                                            label="Language"
                                            placeholder={"Select a language..."}
                                            accepter={SelectPicker}
                                            data={languageOptions}
                                            defaultValue={'en'}
                                            disabledItemValues={['fr', 'es', 'ch', 'ru']}
                                            error={formError.language}
                                            block
                                        />
                                        <Field
                                            name="timeframe"
                                            label="Timeframe"
                                            placeholder={"Select a timeframe..."}
                                            accepter={SelectPicker}
                                            data={timeframeOptions}
                                            error={formError.language}
                                            disabled={true}
                                            block
                                        />
                                    </Form.Stack>
                                    <Form.Stack fontWeight={'600'}>
                                        <Field
                                            name="category"
                                            label="Category"
                                            accepter={CheckboxGroup}
                                            error={formError.category}
                                            inline
                                        >
                                            <Checkbox value={'world'} color={'orange'}>World</Checkbox>
                                            <Checkbox value={'press'} color={'orange'}>Press</Checkbox>
                                            <Checkbox value={'sport'} color={'orange'}>Sport</Checkbox>
                                        </Field>
                                    </Form.Stack>
                                </Form.Stack>
                                <ButtonToolbar mt={20}>
                                    <Button appearance="primary" name='fetchNews' color={'orange'}
                                            onClick={handleSubmit}
                                            loading={isLoading}>
                                        Search
                                    </Button>
                                </ButtonToolbar>
                            </Form>
                        </Card>
                        <FeedList newsList={newsList}/>
                    </VStack>
                </Content>
            </Container>
        </CustomProvider>
    )
}