import axios from 'axios'
import Qs from 'qs'

const Axios = axios.create({
	baseURL: 'http://apiv2.egxiao.com',
	headers: {
		'Content-Type': 'application/x-www-form-urlencoded',
	},
	transformRequest: [function(data) {
		data = Qs.stringify(data);
		return data;
	}],
	responseType: 'json'
})

export default Axios;