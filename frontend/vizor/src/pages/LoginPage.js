import React, { useEffect, useState } from 'react';
import { firestore } from '../firebaseconfig';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { Form, Input, Button, AutoComplete, Modal } from 'antd';

function LoginPage() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [host, setHost] = useState('');
	const [port, setPort] = useState('');
	const [database, setDatabase] = useState('');

	const [form] = Form.useForm();
	const [usernameOptions, setUsernameOptions] = useState([]);
	const [hostOptions, setHostOptions] = useState([]);
	const [portOptions, setPortOptions] = useState([]);
	const [databaseOptions, setDatabaseOptions] = useState([]);

	useEffect(() => {

		const fetchOptions = async (field, setOptions) => {
			const snapshot = await getDocs(collection(firestore, field));
			const options = [];

			snapshot.forEach((doc) => {
				console.log(doc.data());
				console.log(doc.data().value);
				options.push({ value: doc.data().value });
			})

			setOptions(options);
		};

		fetchOptions('usernames', setUsernameOptions);
		fetchOptions('hosts', setHostOptions);
		fetchOptions('ports', setPortOptions);
		fetchOptions('databases', setDatabaseOptions);
	}, []);

	const handleSubmit = async () => {
		try {

			const formData = {
				username,
				password,
				host,
				port,
				database
			};

			const response = await fetch('http://localhost:8080/api/v1/db-login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				Modal.error({
					title: 'Error!',
					content: 'Failed to connect to database.',
				});
				return;
			}

			const values = await form.validateFields();

			if (!usernameOptions.map(e => e.value).includes(values.username)
				&& !hostOptions.map(e => e.value).includes(values.host)
				&& !portOptions.map(e => e.value).includes(values.port)
				&& !databaseOptions.map(e => e.value).includes(values.database)) {
				await addDoc(collection(firestore, 'usernames'), { value: values.username });
				await addDoc(collection(firestore, 'hosts'), { value: values.host });
				await addDoc(collection(firestore, 'ports'), { value: values.port });
				await addDoc(collection(firestore, 'databases'), { value: values.database });
			}

			Modal.success({
				title: 'Success!',
				content: 'Connected to database successfully.',
				onOk: () => window.location.href = '/data-first'
			});
			// window.location.href = '/home';
		} catch (error) {
			Modal.error({
				title: 'Error!',
				content: 'Failed to connect to database.',
			});
		}
	}

	return (
		<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
			<Form form={form} layout='vertical' style={{ padding: "30px" }}>
				<Form.Item label='Username' name='username' rules={[{ required: true, message: 'Username is required' }]}>
					<AutoComplete options={usernameOptions} onChange={setUsername} />
				</Form.Item>

				<Form.Item label='Password' name='password' rules={[{ required: true, message: 'Password is required' }]}>
					<Input.Password value={password} onChange={e => setPassword(e.target.value)} />
				</Form.Item>

				<Form.Item label='Host' name='host' rules={[{ required: true, message: 'Host is required' }]}>
					<AutoComplete options={hostOptions} onChange={setHost} />
				</Form.Item>

				<Form.Item label='Port' name='port' rules={[{ required: true, message: 'Port is required' }]}>
					<AutoComplete options={portOptions} onChange={setPort} />
				</Form.Item>

				<Form.Item label='Database' name='database' rules={[{ required: true, message: 'Database is required' }]}>
					<AutoComplete options={databaseOptions} onChange={setDatabase} />
				</Form.Item>

				<Form.Item>
					<Button type='primary' onClick={handleSubmit}>Submit</Button>
				</Form.Item>
			</Form>
		</div>
	);
}

export default LoginPage;